// src/markdown-core/plugins/heading.ts
import type { MdPlugin, MdNode, MdParent } from '../types';

type MdHeading = MdParent & { type: 'heading'; depth?: number };

const heading: MdPlugin = {
  name: 'heading',

  supportsMd(node) {
    return node.type === 'heading';
  },

  toTiptap(node, ctx) {
    const h = node as MdHeading;
    const level = Math.min(Math.max((h.depth ?? 1), 1), 6);
    const content = ctx.mapMdChildren(h.children ?? []);
    return { type: 'heading', attrs: { level }, content };
  },

  supportsTiptap(node) {
    return node.type === 'heading';
  },

  fromTiptap(node, ctx) {
    const level = Math.min(Math.max((node as { attrs?: { level?: number } }).attrs?.level ?? 1, 1), 6);
    const children = ctx.mapTiptapChildren((node as { content?: MdNode[] }).content ?? []);
    return { type: 'heading', depth: level, children } as MdNode;
  },
};

export default heading;