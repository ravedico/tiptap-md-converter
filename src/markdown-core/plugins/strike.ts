// src/markdown-core/plugins/strike.ts
import type { MdPlugin, MdNode, MdParent, TTNode, TTTextNode } from '../types';

type MdDelete = MdParent & { type: 'delete' };

const strike: MdPlugin = {
  name: 'strike',

  supportsMd(node) {
    return node.type === 'delete';
  },

  toTiptap(node, ctx) {
    const del = node as MdDelete;
    const children = ctx.mapMdChildren(del.children ?? []);
    return children.map((n): TTNode => {
      if (n.type === 'text') {
        const t = n as TTTextNode;
        const marks = t.marks ? [...t.marks, { type: 'strike' as const }] : [{ type: 'strike' as const }];
        return { ...t, marks };
      }
      return n;
    });
  },

  supportsTiptap(node) {
    if (node.type !== 'text') return false;
    const t = node as TTTextNode;
    return Array.isArray(t.marks) && t.marks.some(m => m.type === 'strike');
  },

  fromTiptap(node) {
    const t = node as TTTextNode;
    const mdText: MdNode = { type: 'text', value: t.text ?? '' };
    return { type: 'delete', children: [mdText] } as MdNode;
  },
};

export default strike;