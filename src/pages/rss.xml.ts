import rss from "@astrojs/rss";
import type { APIRoute } from "astro";

import { getPosts } from "../lib/posts";
import { SITE_DESCRIPTION, SITE_TITLE } from "../site";

export const prerender = false;

function escape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function toHtml(plaintext: string): string {
  return plaintext
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escape(paragraph.trim())}</p>`)
    .join("\n");
}

export const GET: APIRoute = async (context) => {
  const posts = await getPosts();

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site ?? "https://mmatt.net",
    items: posts.map((post) => ({
      title: post.title,
      link: `/post/${post.rkey}`,
      pubDate: post.publishedAt,
      description: post.description,
      content: toHtml(post.plaintext),
    })),
  });
};
