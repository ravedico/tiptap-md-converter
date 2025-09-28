// src/markdown-core/types.ts

/**
 * Minimal, stable types for our Markdown ↔ Tiptap converters.
 * Broad enough for all plugins, strict enough to avoid `any`.
 */

/* =========================
 * Markdown (remark) shapes
 * ========================= */
export interface MdBase {
  type: string;
}

export interface MdParent extends MdBase {
  children?: MdNode[];
}

export interface MdLiteral extends MdBase {
  value?: string;
}

export type MdNode = MdParent | MdLiteral | MdBase;

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
  type: 'text';
  text: string;
  marks?: TTMark[];
}

export interface TTElement extends TTBase {
  attrs?: Record<string, unknown>;
  content?: TTNode[];
}

export type TTNode = TTTextNode | TTElement;

export interface TiptapDoc {
  type: 'doc';
  content?: TTNode[];
}

/* =========================
 * Converter context
 * ========================= */
export interface ConvertCtx {
  /** Markdown → Tiptap */
  mapMdChildren(nodes: MdNode[]): TTNode[];
  /** Tiptap → Markdown */
  mapTiptapChildren(nodes: TTNode[]): MdNode[];
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