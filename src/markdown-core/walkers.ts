// src/markdown-core/walkers.ts
import type {
  MdPlugin,
  TTNode,
  ConvertCtx,
  MdNode,
  MdParent,
  MdLiteral,
  TTTextNode,
  TTElement,
} from './types';

// --- utils -----------------------------------------------------------------
export function warn(msg: string, ...extra: unknown[]) {
  // eslint-disable-next-line no-console
  console.warn(`[md↔tt] ${msg}`, ...extra);
}

export const asArray = <T>(x: T | T[] | null | undefined): T[] =>
  x == null ? [] : Array.isArray(x) ? x : [x];

export const flatCompact = <T>(arr: (T | null | undefined | T[])[]): T[] =>
  arr.flatMap((x) => (x == null ? [] : Array.isArray(x) ? x : [x]));

// --- plugin pickers --------------------------------------------------------
export function pickPluginForMd(
  node: MdNode,
  _ctx: ConvertCtx,
  plugins: MdPlugin[],
): MdPlugin | undefined {
  return [...plugins]
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .find((p) => p.supportsMd?.(node));
}

type TTTextWithMarks = TTTextNode & { marks: NonNullable<TTTextNode['marks']> };
const isTextWithMarks = (n: TTNode): n is TTTextWithMarks =>
  n.type === 'text' && Array.isArray((n as TTTextNode).marks);

export function pickPluginForTiptap(
  node: TTNode,
  ctx: ConvertCtx,
  plugins: MdPlugin[],
): MdPlugin | undefined {
  // 1) Text with marks → prefer a plugin whose name matches a mark type
  if (isTextWithMarks(node) && node.marks.length) {
    const markNames = new Set(node.marks.map((m) => m.type).filter(Boolean));
    const byMark = [...plugins]
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
      .find((p) => markNames.has(p.name));
    if (byMark) return byMark;
  }

  // 2) If a plugin exposes supportsTiptap, honor it (respect priority)
  const bySupport = [...plugins]
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .find((p) => {
      const fn = p.supportsTiptap;
      return typeof fn === 'function' && fn(node, ctx);
    });
  if (bySupport) return bySupport;

  // 3) Fallback: match by node.type === plugin.name (blocks like heading/list/table)
  const byName = [...plugins]
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .find((p) => p.name === node.type);
  if (byName) return byName;

  // 4) Nothing claimed it.
  return undefined;
}

// --- default converters (when no plugin claims a node) ---------------------
export function mdDefaultToTiptap(
  node: MdNode,
  convert: (n: MdNode) => TTNode[],
): TTNode[] {
  switch (node.type) {
    case 'root': {
      const children = (node as MdParent).children as MdNode[] | undefined;
      return flatCompact((children ?? []).map(convert));
    }
    case 'paragraph': {
      const children = (node as MdParent).children as MdNode[] | undefined;
      const content = flatCompact((children ?? []).map(convert));
      const paragraph: TTElement = { type: 'paragraph', content };
      return [paragraph];
    }
    case 'text': {
      const value = (node as MdLiteral).value ?? '';
      const text: TTTextNode = { type: 'text', text: value };
      return [text];
    }
    default: {
      const children = (node as MdParent).children as MdNode[] | undefined;
      return children && children.length ? flatCompact(children.map(convert)) : [];
    }
  }
}

export function tiptapDefaultToMd(
  node: TTNode,
  convert: (n: TTNode) => MdNode[],
): MdNode[] {
  switch (node.type) {
    case 'text': {
      const textNode: MdNode = { type: 'text', value: (node as TTTextNode).text ?? '' };
      return [textNode];
    }
    case 'paragraph': {
      const el: TTElement = node as TTElement;
      const children = flatCompact((el.content ?? []).map(convert));
      const paragraph: MdNode = { type: 'paragraph', children: children as MdNode[] };
      return [paragraph];
    }
    default: {
      const el: TTElement = node as TTElement;
      return el.content?.length ? flatCompact((el.content ?? []).map(convert)) : [];
    }
  }
}