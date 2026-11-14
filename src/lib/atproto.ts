/**
 * Tiny ATProto read layer shared by the build and the browser.
 *
 * Everything here is an unauthenticated read against a PDS. When sign-in
 * arrives, an authenticated client (e.g. @atcute/oauth-browser-client) can
 * slot in beside `pds` without changing callers that only read.
 */
import type {} from "@atcute/atproto";
import type {} from "@atcute/bluesky";

import { Client, ok, simpleFetchHandler } from "@atcute/client";
import type { Did, Nsid, ResourceUri } from "@atcute/lexicons";
import type { Blob, LegacyBlob } from "@atcute/lexicons/interfaces";
import { is } from "@atcute/lexicons/validations";
import type { BaseSchema, InferOutput } from "@atcute/lexicons/validations";

import { DID, PDS } from "../site";

export const pds = new Client({ handler: simpleFetchHandler({ service: PDS }) });

export const appview = new Client({
  handler: simpleFetchHandler({ service: "https://public.api.bsky.app" }),
});

export interface Entry<T> {
  uri: ResourceUri;
  rkey: string;
  value: T;
}

export function rkeyOf(uri: string): string {
  return uri.slice(uri.lastIndexOf("/") + 1);
}

/**
 * Lists records from a collection, newest first, keeping only the ones that
 * match `schema`. Malformed records are skipped rather than crashing a page.
 */
export async function listRecords<S extends BaseSchema>(
  collection: Nsid,
  schema: S,
  limit = 50,
  repo: Did = DID,
  client: Client = pds,
): Promise<Entry<InferOutput<S>>[]> {
  const entries: Entry<InferOutput<S>>[] = [];
  let cursor: string | undefined;

  do {
    const page = await ok(
      client.get("com.atproto.repo.listRecords", {
        params: {
          repo,
          collection,
          limit: Math.min(100, limit - entries.length),
          cursor,
        },
      }),
    );

    for (const record of page.records) {
      if (is(schema, record.value)) {
        entries.push({ uri: record.uri, rkey: rkeyOf(record.uri), value: record.value });
      }
    }

    cursor = page.records.length > 0 ? page.cursor : undefined;
  } while (cursor && entries.length < limit);

  return entries;
}

/** Fetches a single record, or `null` if it is missing or doesn't match `schema`. */
export async function getRecord<S extends BaseSchema>(
  uri: ResourceUri,
  schema: S,
  client: Client = pds,
): Promise<Entry<InferOutput<S>> | null> {
  const parsed = parseAtUri(uri);

  if (!parsed) return null;

  const response = await client.get("com.atproto.repo.getRecord", {
    params: parsed,
  });

  if (!response.ok || !is(schema, response.data.value)) return null;

  return { uri: response.data.uri, rkey: parsed.rkey, value: response.data.value };
}

export function parseAtUri(uri: string) {
  const match = /^at:\/\/(did:[a-z]+:[^/]+)\/([^/]+)\/([^/]+)$/.exec(uri);

  if (!match) return null;

  const [, repo, collection, rkey] = match;

  // SAFETY: the regex above only matches strings shaped like a DID and an NSID.
  return { repo: repo as Did, collection: collection as Nsid, rkey };
}

/** Finds the PDS that hosts a DID, so we can read repos other than mine. */
export async function resolvePds(did: Did): Promise<string> {
  if (did === DID) return PDS;

  const url = did.startsWith("did:web:")
    ? `https://${did.slice("did:web:".length)}/.well-known/did.json`
    : `https://plc.directory/${did}`;

  const response = await fetch(url);

  if (!response.ok) throw new Error(`Could not resolve ${did}: ${response.status}`);

  const document: { service?: { id: string; serviceEndpoint: string }[] } = await response.json();

  const service = document.service?.find((entry) => entry.id.endsWith("#atproto_pds"));

  if (!service) throw new Error(`${did} has no PDS`);

  return service.serviceEndpoint;
}

export function clientFor(service: string): Client {
  return service === PDS ? pds : new Client({ handler: simpleFetchHandler({ service }) });
}

/** URL for a blob served through the Bluesky CDN, which resizes and caches it. */
export function blobUrl(
  did: string,
  blob: Blob | LegacyBlob,
  size: "feed_thumbnail" | "feed_fullsize" = "feed_fullsize",
): string {
  const cid = "ref" in blob ? blob.ref.$link : blob.cid;

  return `https://cdn.bsky.app/img/${size}/plain/${did}/${cid}@jpeg`;
}
