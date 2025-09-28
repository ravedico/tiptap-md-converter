// src/markdown-core/plugins/code-inline.ts
import type { MdPlugin, MdNode, TTTextNode } from '../types';

type MdInlineCode = { type: 'inlineCode'; value?: string };

const codeInline: MdPlugin = {
  name: 'code',

  supportsMd(node) {
    return node.type === 'inlineCode';
  },

  toTiptap(node) {
    const ic = node as MdInlineCode;
    const t: TTTextNode = { type: 'text', text: ic.value ?? '', marks: [{ type: 'code' }] };
    return t;
  },

  supportsTiptap(node) {
    if (node.type !== 'text') return false;
    const t = node as TTTextNode;
    return Array.isArray(t.marks) && t.marks.some(m => m.type === 'code');
    },

  fromTiptap(node) {
    const t = node as TTTextNode;
    return { type: 'inlineCode', value: t.text ?? '' } as MdNode;
  },
};

export default codeInline;