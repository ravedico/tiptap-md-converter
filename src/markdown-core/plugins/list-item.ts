// src/markdown-core/plugins/list-item.ts
import type { MdPlugin, MdNode, MdParent } from '../types';

type MdListItem = MdParent & { type: 'listItem' };

const listItem: MdPlugin = {
  name: 'listItem',

  supportsMd(node) { return node.type === 'listItem'; },

  toTiptap(node, ctx) {
    const li = node as MdListItem;
    const content = ctx.mapMdChildren(li.children ?? []);
    return { type: 'listItem', content };
  },

  supportsTiptap(node) { return node.type === 'listItem'; },

  fromTiptap(node, ctx) {
    const children = ctx.mapTiptapChildren((node as { content?: MdNode[] }).content ?? []);
    return { type: 'listItem', children } as MdNode;
  },
};

export default listItem;