import type { MdPlugin, MdNode, MdParent, TTNode } from '../types';

type MdList = MdParent & {
  type: 'list';
  ordered?: boolean;
  children?: Array<MdNode & { checked?: boolean }>;
};
type TTListItem = { type: 'listItem'; content?: TTNode[] };

/** Deep clone a plain mdast subtree to avoid carrying accidental flags. */
function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

/** Remove nodes that can make lists appear “loose” (empty text / empty paragraph). */
function clean(nodes: MdNode[]): MdNode[] {
  const out: MdNode[] = [];
  for (const n of nodes) {
    if (n.type === 'text') {
      const value = (n as { value?: string }).value ?? '';
      if (value.trim() === '') continue;
    }
    if (n.type === 'paragraph') {
      const kids = (n as MdParent).children ?? [];
      if (kids.length === 0) continue;
      const hasReal = kids.some(
        (k) => !(k.type === 'text' && ((k as { value?: string }).value ?? '').trim() === '')
      );
      if (!hasReal) continue;
    }
    out.push(n);
  }
  return out;
}

/** If the first child is a paragraph, inline its children (helps keep the item tight). */
function compactFirstParagraph(nodes: MdNode[]): MdNode[] {
  if (nodes.length === 0) return nodes;
  if (nodes[0].type !== 'paragraph') return nodes;
  const para = nodes[0] as MdParent;
  const inlines = (para.children ?? []) as MdNode[];
  return [...inlines, ...nodes.slice(1)];
}

/** Force tight flags on all list / listItem nodes (old + new fields + data). */
function tighten(node: MdNode): void {
  if (!node || typeof node !== 'object') return;

  const u = node as unknown as {
    type?: string;
    spread?: boolean;
    loose?: boolean;
    data?: { tight?: boolean; spread?: boolean };
  };

  if (u.type === 'list' || u.type === 'listItem') {
    u.spread = false;
    u.loose = false;
    u.data = { ...(u.data ?? {}), tight: true, spread: false };
  }

  const parent = node as unknown as MdParent;
  if (Array.isArray(parent.children)) parent.children.forEach(tighten);
}

const bulletList: MdPlugin = {
  name: 'bulletList',
  priority: 0,

  // Refuse lists that contain task items so taskList can claim them.
  supportsMd(node) {
    if (node.type !== 'list') return false;
    const list = node as MdList;
    const hasTask = (list.children ?? []).some(
      (li) => typeof (li as { checked?: boolean }).checked === 'boolean'
    );
    return !list.ordered && !hasTask;
  },

  // Markdown → Tiptap
  toTiptap(node, ctx) {
    const list = node as MdList;
    const items: TTListItem[] = (list.children ?? []).map((li) => ({
      type: 'listItem',
      content: ctx.mapMdChildren((li as MdParent).children ?? []),
    }));
    return { type: 'bulletList', content: items };
  },

  // Tiptap → Markdown
  supportsTiptap(node) {
    return node.type === 'bulletList';
  },

  fromTiptap(node, ctx) {
    const items = ((node as { content?: TTListItem[] }).content ?? []).map((li) => {
      // map → clone → clean → compact → build item with tight flags
      const mapped = ctx.mapTiptapChildren(li.content ?? []);
      const cloned = clone(mapped);
      const cleaned = clean(cloned);
      const compacted = compactFirstParagraph(cleaned);

      const mdItem = {
        type: 'listItem',
        loose: false,
        spread: false,
        data: { tight: true, spread: false },
        children: compacted,   // or your cleaned/compacted children array
      } as MdNode & { checked?: boolean };

      // never leak a `checked` flag into plain bullets
      if ('checked' in mdItem) {
        delete (mdItem as { checked?: boolean }).checked;
      }

      tighten(mdItem);
      return mdItem as MdNode;
    });

    const md = {
      type: 'list',
      ordered: false,
      spread: false,
      data: { tight: true, spread: false },
      children: items,
    } as MdNode;

    tighten(md);
    return md;
  },
};

export default bulletList;