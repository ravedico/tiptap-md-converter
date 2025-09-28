// src/markdown-core/plugins/blockquote.ts
import type { MdPlugin, MdNode, MdParent } from '../types';

type MdBlockquote = MdParent & { type: 'blockquote' };

const blockquote: MdPlugin = {
  name: 'blockquote',

  supportsMd(node) { return node.type === 'blockquote'; },

  toTiptap(node, ctx) {
    const bq = node as MdBlockquote;
    const content = ctx.mapMdChildren(bq.children ?? []);
    return { type: 'blockquote', content };
  },

  supportsTiptap(node) { return node.type === 'blockquote'; },

  fromTiptap(node, ctx) {
    const children = ctx.mapTiptapChildren((node as { content?: MdNode[] }).content ?? []);
    return { type: 'blockquote', children } as MdNode;
  },
};

export default blockquote;