// src/markdown-core/plugins/table-cell.ts
import type { MdPlugin, MdNode } from '../types';

const tableCell: MdPlugin = {
  name: 'tableCell',

  supportsMd(node) { return node.type === 'tableCell'; },

  toTiptap(node, ctx) {
    const content = ctx.mapMdChildren(((node as { children?: MdNode[] }).children) ?? []);
    return { type: 'tableCell', content };
  },

  supportsTiptap(node) { return node.type === 'tableCell'; },

  fromTiptap(node, ctx) {
    const children = ctx.mapTiptapChildren(((node as { content?: MdNode[] }).content) ?? []);
    return { type: 'tableCell', children } as MdNode;
  },
};

export default tableCell;