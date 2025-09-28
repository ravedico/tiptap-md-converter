// src/markdown-core/normalize-tiptap.ts
import type { TiptapDoc } from './types';

/**
 * Minimal Tiptap JSON node shape (we only touch what we need).
 */
type TTMark = { type: string; attrs?: Record<string, unknown> | null };

/**
 * Canonical order for marks so JSON diffs are stable.
 * (Adjust if your project uses different marks.)
 */
const MARK_ORDER = ['link', 'code', 'bold', 'italic', 'strike'];

/**
 * Sort and dedupe marks in a stable, predictable order.
 */
function sortMarks(marks: TTMark[] | undefined | null): TTMark[] | undefined {
  if (!marks || marks.length < 2) return marks ?? undefined;
  const seen = new Set<string>();
  const deduped = marks.filter(m => {
    const key = m.type;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const rank = (m: TTMark) => {
    const i = MARK_ORDER.indexOf(m.type);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return deduped.sort((a, b) => rank(a) - rank(b));
}

/**
 * Drop null/undefined attrs; drop defaults to reduce noise.
 */
function cleanAttrs(attrs?: Record<string, unknown> | null): Record<string, unknown> | undefined {
  if (!attrs) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null) continue;
    if (k === 'start' && v === 1) continue;          // orderedList default
    out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

type AnyNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown> | null;
  marks?: TTMark[] | null;
  content?: AnyNode[] | null;
};

/**
 * Normalize a single node recursively.
 */
function normalizeNode(node: AnyNode): AnyNode {
  const n: AnyNode = {
    type: node.type,
    text: node.text ? node.text.replace(/\r\n?/g, '\n') : node.text,
    attrs: cleanAttrs(node.attrs ?? undefined),
    marks: sortMarks(node.marks ?? undefined),
    content: node.content ? node.content.map(normalizeNode) : undefined,
  };

  // Ensure defaults for certain node types
  if (n.type === 'orderedList') {
    n.attrs = { start: 1, ...(n.attrs ?? {}) };
  }
  if (n.type === 'taskItem') {
    n.attrs = { checked: false, ...(n.attrs ?? {}) };
  }

  // Drop empty text nodes to avoid noise
  if (n.type === 'text' && (!n.text || n.text.length === 0)) {
    return { type: 'text', text: '' };
  }

  return n;
}

/**
 * Normalize a whole Tiptap document.
 */
export function normalizeTiptapDoc(doc: TiptapDoc): TiptapDoc {
  // Defensive shape check; keep type narrow
  if (!doc || doc.type !== 'doc') {
    return { type: 'doc', content: [] } as TiptapDoc;
  }
  const norm = normalizeNode(doc as unknown as AnyNode) as AnyNode;
  return norm as unknown as TiptapDoc;
}

/**
 * Compare two docs after normalization.
 */
export function areDocsEquivalent(a: TiptapDoc, b: TiptapDoc): boolean {
  const na = normalizeTiptapDoc(a);
  const nb = normalizeTiptapDoc(b);
  return JSON.stringify(na) === JSON.stringify(nb);
}