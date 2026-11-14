/**
 * Latest film from my Letterboxd RSS. Letterboxd doesn't send CORS headers,
 * so the info box reads it through this tiny on-demand route.
 */
import type { APIRoute } from "astro";

import type { Film } from "../../components/InfoBox";

export const prerender = false;

const FEED = "https://letterboxd.com/air2earth/rss/";

function tag(item: string, name: string): string | undefined {
  const match = new RegExp(`<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`).exec(
    item,
  );

  return match?.[1].trim();
}

function toText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function latestFilm(xml: string): Film | null {
  for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const title = tag(item, "title");
    const link = tag(item, "link");

    // The feed also carries lists; only film entries have a filmTitle.
    if (!title || !link || !item.includes("<letterboxd:filmTitle>")) continue;

    const review = toText(tag(item, "description") ?? "");

    return {
      title: toText(title),
      link,
      date: new Date(tag(item, "pubDate") ?? Date.now()).toISOString(),
      review: review || undefined,
    };
  }

  return null;
}

// Cached at the edge by routeRules, so Letterboxd sees about one request per half hour.
export const GET: APIRoute = async (context) => {
  try {
    const response = await fetch(FEED, {
      headers: { "User-Agent": "mmatt.net (+https://mmatt.net)" },
    });

    if (!response.ok) throw new Error(`Letterboxd responded ${response.status}`);

    return Response.json(latestFilm(await response.text()));
  } catch (error) {
    console.error("letterboxd:", error);
    context.cache.set(false);

    return Response.json(null, { status: 502 });
  }
};
