// src/markdown-core/plugins/italic.ts
import type { MdPlugin, MdNode, MdParent, TTNode, TTTextNode } from '../types';

type MdEmphasis = MdParent & { type: 'emphasis' };

const italic: MdPlugin = {
  name: 'italic',

  supportsMd(node) {
    return node.type === 'emphasis';
  },

  toTiptap(node, ctx) {
    const em = node as MdEmphasis;
    const children = ctx.mapMdChildren(em.children ?? []);
    return children.map((n): TTNode => {
      if (n.type === 'text') {
        const t = n as TTTextNode;
        const marks = t.marks ? [...t.marks, { type: 'italic' as const }] : [{ type: 'italic' as const }];
        return { ...t, marks };
      }
      return n;
    });
  },

  supportsTiptap(node) {
    if (node.type !== 'text') return false;
    const t = node as TTTextNode;
    return Array.isArray(t.marks) && t.marks.some(m => m.type === 'italic');
  },

  fromTiptap(node) {
    const t = node as TTTextNode;
    const mdText: MdNode = { type: 'text', value: t.text ?? '' };
    return { type: 'emphasis', children: [mdText] } as MdNode;
  },
};

export default italic;