import type { MdPlugin, MdNode, MdParent, TTNode } from '../types';

type MdList = MdParent & { type: 'list'; ordered?: boolean };
type MdTaskItem = MdParent & { type: 'listItem'; checked?: boolean };
type TTTaskItem = { type: 'taskItem'; attrs?: { checked?: boolean }; content?: TTNode[] };

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

const taskList: MdPlugin = {
  name: 'taskList',
  priority: 100,

  // Only treat as task list if a child has a boolean `checked`.
  supportsMd(node) {
    if (node.type !== 'list') return false;
    const list = node as MdList;
    return (list.children ?? []).some(
      (li) => typeof (li as MdTaskItem).checked === 'boolean'
    );
  },

  // Markdown → Tiptap
  toTiptap(node, ctx) {
    const list = node as MdList;
    const items: TTTaskItem[] = (list.children ?? []).map((li) => {
      const itm = li as MdTaskItem;
      return {
        type: 'taskItem',
        // normalize to strict boolean
        attrs: { checked: itm.checked === true },
        content: ctx.mapMdChildren(itm.children ?? []),
      };
    });
    return { type: 'taskList', content: items };
  },

  // Tiptap → Markdown
  supportsTiptap(node) {
    return node.type === 'taskList';
  },

  fromTiptap(node, ctx) {
    const items = ((node as { content?: TTTaskItem[] }).content ?? []).map((it) => {
      const mdItem = {
        type: 'listItem',
        checked: it.attrs?.checked === true,
        children: ctx.mapTiptapChildren(it.content ?? []),
      } as MdNode;
      tighten(mdItem);
      return mdItem;
    });

    const md = {
      type: 'list',
      ordered: false,
      children: items,
    } as MdNode;

    tighten(md);
    return md;
  },
};

export default taskList;