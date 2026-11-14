/**
 * My writing: site.standard.document records in my publication, plus a few
 * documents I wrote for other publications. Read on demand; pages that use
 * this are cached at the edge (see routeRules in astro.config.mjs), so there
 * is deliberately no in-memory cache here that could go stale in a Worker.
 */
import type { Did, ResourceUri } from "@atcute/lexicons";
import { SiteStandardDocument, SiteStandardPublication } from "@atcute/standard-site";

import { DID, EXTERNAL_POSTS, PUBLICATION_URI } from "../site";
import {
  clientFor,
  getRecord,
  listRecords,
  parseAtUri,
  resolvePds,
  rkeyOf,
  type Entry,
} from "./atproto";
import { isLeafletContent, toNodes, toPlaintext, type LeafletNode } from "./leaflet";

export interface Post {
  rkey: string;
  uri: ResourceUri;
  /** Repo the document lives in; blobs are served from here. */
  did: Did;
  title: string;
  description?: string;
  publishedAt: Date;
  updatedAt?: Date;
  nodes: LeafletNode[];
  plaintext: string;
  /** Where the post lives on its publication's own site. */
  originalUrl: string;
  /** Written for someone else's publication. */
  isExternal: boolean;
}

type Document = SiteStandardDocument.Main;

/** A single post by record key, or `null` if there's no such post. */
export async function getPost(rkey: string): Promise<Post | null> {
  const external = EXTERNAL_POSTS.find((uri) => rkeyOf(uri) === rkey);

  if (external) return loadExternalPost(external);

  const [publication, document] = await Promise.all([
    getRecord(PUBLICATION_URI, SiteStandardPublication.mainSchema),
    getRecord(`at://${DID}/site.standard.document/${rkey}`, SiteStandardDocument.mainSchema),
  ]);

  if (!publication || document?.value.site !== PUBLICATION_URI) return null;

  return toPost(document, publication.value, false);
}

export async function getLatestPost(): Promise<Post | undefined> {
  const [latest] = await getPosts();

  return latest;
}

export function readingTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;

  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/** All posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const [publication, documents, external] = await Promise.all([
    getRecord(PUBLICATION_URI, SiteStandardPublication.mainSchema),
    listRecords("site.standard.document", SiteStandardDocument.mainSchema, 1000),
    Promise.all(EXTERNAL_POSTS.map(loadExternalPost)),
  ]);

  if (!publication) throw new Error(`Publication ${PUBLICATION_URI} not found`);

  const own = documents
    .filter((entry) => entry.value.site === PUBLICATION_URI)
    .map((entry) => toPost(entry, publication.value, false));

  return [...own, ...external]
    .filter((post): post is Post => post !== null)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

async function loadExternalPost(uri: string): Promise<Post | null> {
  const parsed = parseAtUri(uri);

  if (!parsed) return null;

  try {
    const client = clientFor(await resolvePds(parsed.repo));
    // SAFETY: parseAtUri accepted it, so it is a well-formed AT URI.
    const document = await getRecord(uri as ResourceUri, SiteStandardDocument.mainSchema, client);

    if (!document) return null;

    const publication = await getRecord(
      // SAFETY: `site` is validated as a URI; getRecord rejects anything that isn't an AT URI.
      document.value.site as ResourceUri,
      SiteStandardPublication.mainSchema,
      clientFor(await resolvePds(parseAtUri(document.value.site)?.repo ?? parsed.repo)),
    );

    if (!publication) return null;

    return toPost(document, publication.value, true);
  } catch (error) {
    console.warn(`Skipping external post ${uri}:`, error);

    return null;
  }
}

function toPost(
  entry: Entry<Document>,
  publication: SiteStandardPublication.Main,
  isExternal: boolean,
): Post | null {
  const { value: document, uri, rkey } = entry;
  const did = parseAtUri(uri)?.repo;

  if (!did || !isLeafletContent(document.content)) {
    console.warn(`Skipping ${uri}: not a Leaflet document`);

    return null;
  }

  const nodes = toNodes(document.content, did);

  return {
    rkey,
    uri,
    did,
    title: document.title,
    description: document.description || undefined,
    publishedAt: new Date(document.publishedAt),
    updatedAt: document.updatedAt ? new Date(document.updatedAt) : undefined,
    nodes,
    plaintext: document.textContent ?? toPlaintext(nodes),
    originalUrl: new URL(document.path ?? `/${rkey}`, publication.url).toString(),
    isExternal,
  };
}
