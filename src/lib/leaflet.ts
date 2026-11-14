/**
 * Normalizes Leaflet document content into a small, render-ready tree.
 * Templates in src/components/leaflet render this tree; they never see raw
 * lexicon shapes.
 */
import {
  PubLeafletBlocksBlockquote,
  PubLeafletBlocksBskyPost,
  PubLeafletBlocksCode,
  PubLeafletBlocksHeader,
  PubLeafletBlocksHorizontalRule,
  PubLeafletBlocksImage,
  PubLeafletBlocksOrderedList,
  PubLeafletBlocksText,
  PubLeafletBlocksUnorderedList,
  PubLeafletBlocksWebsite,
  PubLeafletContent,
  PubLeafletPagesLinearDocument,
} from "@atcute/leaflet";
import { is } from "@atcute/lexicons/validations";

import { blobUrl } from "./atproto";
import { leafletSegments, type Segment } from "./richtext";

export type Align = "left" | "center" | "right" | "justify";

export interface ImageNode {
  kind: "image";
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ListNode {
  kind: "list";
  ordered: boolean;
  start: number;
  items: ListItem[];
}

export interface ListItem {
  segments: Segment[];
  image?: ImageNode;
  checked?: boolean;
  children?: ListNode;
}

export type LeafletNode = (
  | { kind: "paragraph"; segments: Segment[]; size: "small" | "default" | "large" }
  | { kind: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; segments: Segment[] }
  | { kind: "code"; code: string; lang?: string }
  | { kind: "quote"; segments: Segment[] }
  | { kind: "rule" }
  | { kind: "bsky"; uri: string }
  | { kind: "website"; href: string; title?: string; description?: string }
  | ImageNode
  | ListNode
) & { align?: Align };

type UnorderedItem = PubLeafletBlocksUnorderedList.ListItem;

type OrderedItem = PubLeafletBlocksOrderedList.ListItem;

export function isLeafletContent(value: unknown): value is PubLeafletContent.Main {
  return is(PubLeafletContent.mainSchema, value);
}

export function toNodes(content: PubLeafletContent.Main, did: string): LeafletNode[] {
  const nodes: LeafletNode[] = [];

  for (const page of content.pages ?? []) {
    if (!is(PubLeafletPagesLinearDocument.mainSchema, page)) continue;

    for (const { block, alignment } of page.blocks) {
      const node = toNode(block, did);

      if (!node) continue;

      const align = toAlign(alignment);
      nodes.push(align ? { ...node, align } : node);
    }
  }

  return nodes;
}

/** Plain text of a document, for reading time and the RSS feed. */
export function toPlaintext(nodes: readonly LeafletNode[]): string {
  const lines: string[] = [];
  const segmentsText = (segments: Segment[]) => segments.map((s) => s.text).join("");

  const visitList = (list: ListNode) => {
    for (const item of list.items) {
      lines.push(segmentsText(item.segments));

      if (item.children) visitList(item.children);
    }
  };

  for (const node of nodes) {
    if ("segments" in node) lines.push(segmentsText(node.segments));
    else if (node.kind === "code") lines.push(node.code);
    else if (node.kind === "list") visitList(node);
  }

  return lines.filter(Boolean).join("\n\n");
}

function toNode(
  block: PubLeafletPagesLinearDocument.Block["block"],
  did: string,
): LeafletNode | null {
  if (is(PubLeafletBlocksText.mainSchema, block)) {
    return {
      kind: "paragraph",
      segments: leafletSegments(block.plaintext, block.facets),
      size: block.textSize ?? "default",
    };
  }

  if (is(PubLeafletBlocksHeader.mainSchema, block)) {
    return {
      kind: "heading",
      level: clampLevel(block.level),
      segments: leafletSegments(block.plaintext, block.facets),
    };
  }

  if (is(PubLeafletBlocksImage.mainSchema, block)) return toImage(block, did);

  if (is(PubLeafletBlocksCode.mainSchema, block)) {
    return { kind: "code", code: block.plaintext, lang: block.language };
  }

  if (is(PubLeafletBlocksBlockquote.mainSchema, block)) {
    return { kind: "quote", segments: leafletSegments(block.plaintext, block.facets) };
  }

  if (is(PubLeafletBlocksHorizontalRule.mainSchema, block)) return { kind: "rule" };

  if (is(PubLeafletBlocksBskyPost.mainSchema, block)) {
    return { kind: "bsky", uri: block.postRef.uri };
  }

  if (is(PubLeafletBlocksUnorderedList.mainSchema, block)) {
    return toList(block.children, false, 1, did);
  }

  if (is(PubLeafletBlocksOrderedList.mainSchema, block)) {
    return toList(block.children, true, block.startIndex ?? 1, did);
  }

  if (is(PubLeafletBlocksWebsite.mainSchema, block)) {
    return {
      kind: "website",
      href: block.src,
      title: block.title,
      description: block.description,
    };
  }

  return null;
}

function toImage(block: PubLeafletBlocksImage.Main, did: string): ImageNode {
  return {
    kind: "image",
    src: blobUrl(did, block.image),
    alt: block.alt ?? "",
    width: block.aspectRatio.width,
    height: block.aspectRatio.height,
  };
}

function toList(
  items: readonly (UnorderedItem | OrderedItem)[],
  ordered: boolean,
  start: number,
  did: string,
): ListNode {
  return {
    kind: "list",
    ordered,
    start,
    items: items.map((item) => toListItem(item, ordered, did)),
  };
}

function toListItem(item: UnorderedItem | OrderedItem, ordered: boolean, did: string): ListItem {
  const { content } = item;
  const result: ListItem = { segments: [], checked: item.checked };

  if (is(PubLeafletBlocksImage.mainSchema, content)) {
    result.image = toImage(content, did);
  } else if (
    is(PubLeafletBlocksText.mainSchema, content) ||
    is(PubLeafletBlocksHeader.mainSchema, content)
  ) {
    result.segments = leafletSegments(content.plaintext, content.facets);
  }

  if (item.children && item.children.length > 0) {
    result.children = toList(item.children, ordered, 1, did);
  } else if ("orderedListChildren" in item && item.orderedListChildren) {
    const nested = item.orderedListChildren;
    result.children = toList(nested.children, true, nested.startIndex ?? 1, did);
  } else if ("unorderedListChildren" in item && item.unorderedListChildren) {
    result.children = toList(item.unorderedListChildren.children, false, 1, did);
  }

  return result;
}

function toAlign(alignment: string | undefined): Align | undefined {
  if (alignment?.endsWith("#textAlignCenter")) return "center";

  if (alignment?.endsWith("#textAlignRight")) return "right";

  if (alignment?.endsWith("#textAlignJustify")) return "justify";

  return undefined;
}

function clampLevel(level: number | undefined): 1 | 2 | 3 | 4 | 5 | 6 {
  switch (level) {
    case 2:
      return 2;
    case 3:
      return 3;
    case 4:
      return 4;
    case 5:
      return 5;
    case 6:
      return 6;
    default:
      return 1;
  }
}
