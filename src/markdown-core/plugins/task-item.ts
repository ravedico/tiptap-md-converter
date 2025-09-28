// src/markdown-core/plugins/task-item.ts
import type { MdPlugin, MdNode } from '../types';

const taskItem: MdPlugin = {
  name: 'taskItem',

  supportsMd(node) { return node.type === 'listItem' && 'checked' in (node as object); },

  toTiptap(node, ctx) {
    const checked = ((node as { checked?: boolean }).checked) ?? false;
    const content = ctx.mapMdChildren(((node as { children?: MdNode[] }).children) ?? []);
    return { type: 'taskItem', attrs: { checked }, content };
  },

  supportsTiptap(node) { return node.type === 'taskItem'; },

  fromTiptap(node, ctx) {
    const checked = ((node as { attrs?: { checked?: boolean } }).attrs?.checked) ?? false;
    const children = ctx.mapTiptapChildren(((node as { content?: MdNode[] }).content) ?? []);
    return { type: 'listItem', checked, children } as MdNode;
  },
};

export default taskItem;