/**
 * Bluesky post lookups, used to render embedded posts as static
 * HTML instead of shipping the embed.bsky.app iframe.
 */
import { AppBskyEmbedImages, AppBskyFeedPost } from "@atcute/bluesky";
import { ok } from "@atcute/client";
import type { ResourceUri } from "@atcute/lexicons";
import { is } from "@atcute/lexicons/validations";

import { appview, parseAtUri } from "./atproto";
import { blueskySegments, type Segment } from "./richtext";

export interface EmbeddedPost {
  href: string;
  authorName: string;
  authorHandle: string;
  authorUrl: string;
  avatar?: string;
  segments: Segment[];
  createdAt: Date;
  images: { thumb: string; alt: string }[];
}

export async function getEmbeddedPost(uri: string): Promise<EmbeddedPost | null> {
  try {
    return await loadPost(uri);
  } catch (error) {
    console.warn(`Could not load Bluesky post ${uri}:`, error);

    return null;
  }
}

export function bskyAppUrl(uri: string): string {
  const parsed = parseAtUri(uri);

  return parsed ? `https://bsky.app/profile/${parsed.repo}/post/${parsed.rkey}` : uri;
}

async function loadPost(uri: string): Promise<EmbeddedPost | null> {
  const { posts } = await ok(
    // SAFETY: callers pass the AT URI straight from a validated bskyPost block.
    appview.get("app.bsky.feed.getPosts", { params: { uris: [uri as ResourceUri] } }),
  );

  const [view] = posts;

  if (!view || !is(AppBskyFeedPost.mainSchema, view.record)) return null;

  const { author, record } = view;

  return {
    href: bskyAppUrl(view.uri),
    authorName: author.displayName || author.handle,
    authorHandle: author.handle,
    authorUrl: `https://bsky.app/profile/${author.handle}`,
    avatar: author.avatar,
    segments: blueskySegments(record.text, record.facets),
    createdAt: new Date(record.createdAt),
    images: is(AppBskyEmbedImages.viewSchema, view.embed)
      ? view.embed.images.map((image) => ({ thumb: image.thumb, alt: image.alt }))
      : [],
  };
}
