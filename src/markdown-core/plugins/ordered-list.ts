import type { MdPlugin, MdNode, MdParent, TTNode } from '../types';

type MdList = MdParent & { type: 'list'; ordered?: boolean };
type TTListItem = { type: 'listItem'; content?: TTNode[] };

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
  const children = parent.children;
  if (Array.isArray(children)) children.forEach(tighten);
}

const orderedList: MdPlugin = {
  name: 'orderedList',
  priority: 10,

  supportsMd(node) {
    return node.type === 'list' && (node as MdList).ordered === true;
  },

  // Markdown → Tiptap
  toTiptap(node, ctx) {
    const list = node as MdList;
    const items: TTListItem[] = (list.children ?? []).map((li) => ({
      type: 'listItem',
      content: ctx.mapMdChildren((li as MdParent).children ?? []),
    }));
    return { type: 'orderedList', content: items };
  },

  // Tiptap → Markdown
  supportsTiptap(node) {
    return node.type === 'orderedList';
  },

  fromTiptap(node, ctx) {
    const items = ((node as { content?: TTListItem[] }).content ?? []).map((li) => {
      const mdItem = {
        type: 'listItem',
        children: ctx.mapTiptapChildren(li.content ?? []),
      } as MdNode & { checked?: boolean };

      if ('checked' in mdItem) delete (mdItem as { checked?: boolean }).checked;

      tighten(mdItem);
      return mdItem as MdNode;
    });

    const md = {
      type: 'list',
      ordered: true,
      children: items,
    } as MdNode;

    tighten(md);
    return md;
  },
};

export default orderedList;