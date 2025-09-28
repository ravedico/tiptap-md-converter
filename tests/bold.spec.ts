// tests/bold.spec.ts
import { describe, it, expect } from 'vitest';
import { mdToTiptap } from '@/markdown-core/md-to-tiptap';
import { tiptapToMd } from '@/markdown-core/tiptap-to-md';
import { normalizeMd } from './helpers/normalize';
import type { TiptapDoc, TTNode, TTTextNode } from '@/markdown-core/types';

describe('Bold plugin', () => {
  it('Markdown → Tiptap: **bold** becomes a bold mark', async () => {
    const doc = await mdToTiptap('A **bold** move');
    const paragraph = doc.content?.[0];
    expect(paragraph?.type).toBe('paragraph');

    // dig into paragraph content (filter text nodes safely)
    const nodes = (paragraph && 'content' in paragraph ? (paragraph as { content?: TTNode[] }).content : []) ?? [];
    const textNodes = nodes.filter((n): n is TTTextNode => n.type === 'text');
    const boldNode = textNodes.find((t) => Array.isArray(t.marks) && t.marks.some((m) => m.type === 'bold'));

    expect(boldNode?.text).toBe('bold');
  });

  it('Tiptap → Markdown: bold mark turns into **text**', async () => {
    const doc: TiptapDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'A ' },
            { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' move' },
          ],
        },
      ],
    };

    const md = await tiptapToMd(doc);
    expect(await normalizeMd(md)).toBe('A **bold** move');
  });

  it('Round-trip', async () => {
    const input = 'Mix **bold** and *italic* with ~~strike~~.';
    const doc = await mdToTiptap(input);
    const md = await tiptapToMd(doc);
    const out = await normalizeMd(md);
    expect(out).toBe(await normalizeMd(input));
  });
});