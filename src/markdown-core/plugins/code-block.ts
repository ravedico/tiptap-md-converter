// src/markdown-core/plugins/code-block.ts
import type { MdPlugin, MdNode } from '../types';

type MdCode = { type: 'code'; lang?: string; value?: string };

const codeBlock: MdPlugin = {
  name: 'codeBlock',

  supportsMd(node) { return node.type === 'code'; },

  toTiptap(node) {
    const c = node as MdCode;
    const text = c.value ?? '';
    return {
      type: 'codeBlock',
      attrs: c.lang ? { language: c.lang } : undefined,
      content: text ? [{ type: 'text', text }] : [],
    };
  },

  supportsTiptap(node) { return node.type === 'codeBlock'; },

  fromTiptap(node) {
    const text = ((node as { content?: { type: 'text'; text?: string }[] }).content ?? [])
      .map(n => n.text ?? '')
      .join('');
    const lang = (node as { attrs?: { language?: string } }).attrs?.language;
    return { type: 'code', lang, value: text } as MdNode;
  },
};

export default codeBlock;