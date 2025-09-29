// src/markdown-core/types.ts

/**
 * Types for Markdown ↔ Tiptap converters.
 * These are broad enough for all plugins, strict enough to avoid `any`.
 */

/* =========================
 * Markdown (remark-like) shapes
 * ========================= */
export interface MdBase {
  type: string;
}

export interface MdParent extends MdBase {
  children?: MdNode[];
}

export interface MdLiteral extends MdBase {
  value?: string;
  url?: string;         // for links
  lang?: string | null; // for code blocks
  depth?: number;       // for headings
  ordered?: boolean;    // for lists
  checked?: boolean | null; // for task items
}

export type MdNode = MdParent | MdLiteral | MdBase;

/** Specifically for lists */
export interface MdList extends MdParent {
  type: "list";
  ordered?: boolean;
  start?: number;      // starting number for ordered lists
  spread?: boolean;    // tight/loose list formatting hint
  children: MdListItem[];
}

export interface MdListItem extends MdParent {
  type: "listItem";
  checked?: boolean | null; // task lists
  spread?: boolean;         // tight/loose list formatting hint
  children: MdNode[];
}

/* =========================
 * Tiptap JSON shapes
 * ========================= */
export interface TTMark {
  type: string; // 'bold' | 'italic' | 'strike' | 'link' | 'code' | ...
  attrs?: Record<string, unknown>;
}

export interface TTBase {
  type: string; // 'text' | 'paragraph' | 'heading' | ...
}

export interface TTTextNode extends TTBase {
  type: "text";
  text: string;
  marks?: TTMark[];
}

export interface TTElement extends TTBase {
  attrs?: Record<string, unknown>;
  content?: TTNode[];
}

export type TTNode = TTTextNode | TTElement;

export interface TiptapDoc {
  type: "doc";
  content?: TTNode[];
}

/* =========================
 * Converter context
 * ========================= */
export interface ConvertCtx {
  /** Markdown → Tiptap */
  mapMdChildren(nodes: MdNode[] | undefined): TTNode[];
  /** Tiptap → Markdown */
  mapTiptapChildren(nodes: TTNode[] | undefined): MdNode[];
  /** Turn a Tiptap text node into a Markdown text node */
  tiptapInlineToMd(text: TTTextNode): MdNode;
}

/* =========================
 * Plugin interface
 * ========================= */
export interface MdPlugin {
  /** For blocks, align with the Tiptap node type (e.g. 'heading'). */
  name: string;
  /** Higher number wins when multiple plugins claim a node. */
  priority?: number;

  // Markdown → Tiptap
  supportsMd?(node: MdNode, ctx?: ConvertCtx): boolean;
  toTiptap?(node: MdNode, ctx: ConvertCtx): TTNode | TTNode[] | null;

  // Tiptap → Markdown
  supportsTiptap?(node: TTNode, ctx?: ConvertCtx): boolean;
  fromTiptap?(node: TTNode, ctx: ConvertCtx): MdNode | MdNode[] | null;
}