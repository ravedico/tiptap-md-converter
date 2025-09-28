// src/markdown-core/plugins/text.ts
import type { MdPlugin, MdNode } from '../types';

const text: MdPlugin = {
  name: 'text',
  supportsMd(n) { return n.type === 'text'; },
  toTiptap(n) {
    const value = (n as { value?: string }).value ?? '';
    return { type: 'text', text: value };
  },
  supportsTiptap(n) { return n.type === 'text'; },
  fromTiptap(n) {
    const text = (n as { text?: string }).text ?? '';
    return { type: 'text', value: text } as MdNode;
  },
};

export default text;