// src/markdown-core/plugins/link.ts
import type { MdPlugin, MdNode, MdParent, TTNode, TTTextNode } from '../types';

type MdLink = MdParent & { type: 'link'; url?: string; title?: string };

const link: MdPlugin = {
  name: 'link',

  supportsMd(node) {
    return node.type === 'link';
  },

  toTiptap(node, ctx) {
    const l = node as MdLink;
    const href = l.url;
    const children = ctx.mapMdChildren(l.children ?? []);
    return children.map((n): TTNode => {
      if (n.type === 'text') {
        const t = n as TTTextNode;
        const mark = { type: 'link' as const, attrs: href ? { href } : undefined };
        const marks = t.marks ? [...t.marks, mark] : [mark];
        return { ...t, marks };
      }
      return n;
    });
  },

  supportsTiptap(node) {
    if (node.type !== 'text') return false;
    const t = node as TTTextNode;
    return Array.isArray(t.marks) && t.marks.some(m => m.type === 'link');
  },

  fromTiptap(node) {
    const t = node as TTTextNode;
    const mark = (t.marks ?? []).find(m => m.type === 'link');
    const href = (mark?.attrs && 'href' in mark.attrs!) ? (mark.attrs as { href?: string }).href : undefined;
    const mdText: MdNode = { type: 'text', value: t.text ?? '' };
    return { type: 'link', url: href, children: [mdText] } as MdNode;
  },
};

export default link;