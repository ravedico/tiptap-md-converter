// src/markdown-core/plugins/table-row.ts
import type { MdPlugin, MdNode, TTNode } from '../types';

// remark-gfm table row/cell shapes
type MdTableRow = { type: 'tableRow'; children?: MdTableCell[] };
type MdTableCell = { type: 'tableCell'; children?: MdNode[] };

// tiptap table row/cell shapes
type TTTableCell = { type: 'tableCell'; content?: TTNode[] };
type TTTableRow = { type: 'tableRow'; content?: TTTableCell[] };

const tableRow: MdPlugin = {
  name: 'tableRow',

  supportsMd(node) {
    return node.type === 'tableRow';
  },

  toTiptap(node, ctx) {
    const row = node as MdTableRow;
    const content: TTTableCell[] = (row.children ?? []).map((cell) => ({
      type: 'tableCell',
      content: ctx.mapMdChildren(cell.children ?? []),
    }));
    const tt: TTTableRow = { type: 'tableRow', content };
    return tt;
  },

  supportsTiptap(node) {
    return node.type === 'tableRow';
  },

  fromTiptap(node, ctx) {
    const tr = node as TTTableRow;
    const children: MdTableCell[] = (tr.content ?? []).map((cell) => ({
      type: 'tableCell',
      children: ctx.mapTiptapChildren(cell.content ?? []),
    }));
    const md: MdTableRow = { type: 'tableRow', children };
    return md as unknown as MdNode;
  },
};

export default tableRow;