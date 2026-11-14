/**
 * Social cards: /og/site.png for the site, /og/<rkey>.png for each post.
 * All generated at build time.
 */
import type { APIRoute, GetStaticPaths } from "astro";

import { renderCard } from "../../lib/og";
import { getPosts } from "../../lib/posts";

interface Props {
  title?: string;
}

export const getStaticPaths = (async () => {
  const posts = await getPosts();

  return [
    { params: { slug: "site" }, props: {} },
    ...posts.map((post) => ({ params: { slug: post.rkey }, props: { title: post.title } })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = async ({ props }) =>
  new Response(await renderCard(props.title), {
    headers: { "Content-Type": "image/png" },
  });
