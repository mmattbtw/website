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

export const GET: APIRoute = async () => {
  try {
    const response = await fetch(FEED, {
      headers: { "User-Agent": "mmatt.net (+https://mmatt.net)" },
      // Let Cloudflare's edge cache the upstream feed so we don't hammer Letterboxd.
      cf: { cacheTtl: 1800, cacheEverything: true },
    });

    if (!response.ok) throw new Error(`Letterboxd responded ${response.status}`);

    return Response.json(latestFilm(await response.text()), {
      headers: { "Cache-Control": "public, max-age=900" },
    });
  } catch (error) {
    console.error("letterboxd:", error);

    return Response.json(null, { status: 502 });
  }
};
