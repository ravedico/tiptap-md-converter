// src/markdown-core/plugins/table.ts
import type { MdPlugin, MdNode, MdParent, TTNode } from '../types';

type MdTable = { type: 'table'; children?: MdTableRow[] };
type MdTableRow = { type: 'tableRow'; children?: MdTableCell[] };
type MdTableCell = MdParent & { type: 'tableCell' };

type TTTable = { type: 'table'; content?: TTTableRow[] };
type TTTableRow = { type: 'tableRow'; content?: TTTableCell[] };
type TTTableCell = { type: 'tableCell'; content?: TTNode[] };

const table: MdPlugin = {
  name: 'table',

  supportsMd(node) { return node.type === 'table'; },

  toTiptap(node, ctx) {
    const t = node as MdTable;
    const rows: TTTableRow[] = (t.children ?? []).map((tr) => ({
      type: 'tableRow',
      content: (tr.children ?? []).map((td) => ({
        type: 'tableCell',
        content: ctx.mapMdChildren((td.children ?? []) as MdNode[]),
      })),
    }));
    const out: TTTable = { type: 'table', content: rows };
    return out;
  },

  supportsTiptap(node) { return node.type === 'table'; },

  fromTiptap(node, ctx) {
    const rows: MdTableRow[] = (((node as { content?: TTTableRow[] }).content) ?? []).map((tr) => ({
      type: 'tableRow',
      children: (tr.content ?? []).map((td) => ({
        type: 'tableCell',
        children: ctx.mapTiptapChildren(td.content ?? []),
      })),
    }));
    const md: MdTable = { type: 'table', children: rows };
    return md as unknown as MdNode;
  },
};

export default table;