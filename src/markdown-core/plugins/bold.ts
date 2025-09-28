// src/markdown-core/plugins/bold.ts
import type { MdPlugin, MdNode, MdParent, TTNode, TTTextNode } from '../types';

type MdStrong = MdParent & { type: 'strong' };

const bold: MdPlugin = {
  name: 'bold',

  supportsMd(node) {
    return node.type === 'strong';
  },

  toTiptap(node, ctx) {
    const strong = node as MdStrong;
    const children = ctx.mapMdChildren(strong.children ?? []);
    return children.map((n): TTNode => {
      if (n.type === 'text') {
        const t = n as TTTextNode;
        const marks = t.marks ? [...t.marks, { type: 'bold' as const }] : [{ type: 'bold' as const }];
        return { ...t, marks };
      }
      return n;
    });
  },

  supportsTiptap(node) {
    if (node.type !== 'text') return false;
    const t = node as TTTextNode;
    return Array.isArray(t.marks) && t.marks.some(m => m.type === 'bold');
  },

  fromTiptap(node) {
    const t = node as TTTextNode;
    const mdText: MdNode = { type: 'text', value: t.text ?? '' };
    return { type: 'strong', children: [mdText] } as MdNode;
  },
};

export default bold;