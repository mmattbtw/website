/**
 * Turns plaintext + byte-indexed facets (Leaflet or Bluesky flavored) into a
 * flat list of styled segments that templates can render without knowing
 * anything about facets.
 */

export interface Segment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  highlight?: boolean;
  href?: string;
}

export interface Facet<F> {
  index: { byteStart: number; byteEnd: number };
  features: readonly F[];
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Splits `text` at every facet boundary, then applies each facet that fully
 * covers a piece. Overlapping facets (bold inside a link) just work.
 */
export function toSegments<F>(
  text: string,
  facets: readonly Facet<F>[] | undefined,
  apply: (segment: Segment, feature: F) => void,
): Segment[] {
  if (!facets || facets.length === 0) return [{ text }];

  const bytes = encoder.encode(text);
  const clamp = (n: number) => Math.max(0, Math.min(bytes.length, n));
  const cuts = new Set([0, bytes.length]);

  for (const facet of facets) {
    cuts.add(clamp(facet.index.byteStart));
    cuts.add(clamp(facet.index.byteEnd));
  }

  const points = [...cuts].sort((a, b) => a - b);
  const segments: Segment[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    const segment: Segment = { text: decoder.decode(bytes.subarray(start, end)) };

    for (const facet of facets) {
      if (facet.index.byteStart > start || facet.index.byteEnd < end) continue;

      for (const feature of facet.features) apply(segment, feature);
    }

    segments.push(segment);
  }

  return segments;
}

interface LeafletFeature {
  $type?: string;
  uri?: string;
}

export function leafletSegments(
  text: string,
  facets: readonly Facet<LeafletFeature>[] | undefined,
): Segment[] {
  return toSegments(text, facets, (segment, feature) => {
    switch (feature.$type) {
      case "pub.leaflet.richtext.facet#bold":
        segment.bold = true;
        break;
      case "pub.leaflet.richtext.facet#italic":
        segment.italic = true;
        break;
      case "pub.leaflet.richtext.facet#underline":
        segment.underline = true;
        break;
      case "pub.leaflet.richtext.facet#strikethrough":
        segment.strike = true;
        break;
      case "pub.leaflet.richtext.facet#code":
        segment.code = true;
        break;
      case "pub.leaflet.richtext.facet#highlight":
        segment.highlight = true;
        break;
      case "pub.leaflet.richtext.facet#link":
        segment.href = feature.uri;
        break;
    }
  });
}

interface BlueskyFeature {
  $type?: string;
  uri?: string;
  did?: string;
  tag?: string;
}

export function blueskySegments(
  text: string,
  facets: readonly Facet<BlueskyFeature>[] | undefined,
): Segment[] {
  return toSegments(text, facets, (segment, feature) => {
    switch (feature.$type) {
      case "app.bsky.richtext.facet#link":
        segment.href = feature.uri;
        break;
      case "app.bsky.richtext.facet#mention":
        segment.href = `https://bsky.app/profile/${feature.did}`;
        break;
      case "app.bsky.richtext.facet#tag":
        segment.href = `https://bsky.app/hashtag/${encodeURIComponent(feature.tag ?? "")}`;
        break;
    }
  });
}
