import { describe, it, expect } from 'vitest';
import { mdToTiptap } from '@/markdown-core/md-to-tiptap';
import { tiptapToMd } from '@/markdown-core/tiptap-to-md';
import { normalizeMd } from './helpers/normalize';
import type { TiptapDoc, TTElement } from '@/markdown-core/types';

describe('Headings plugin', () => {
  it('Markdown → Tiptap: # H1 becomes heading level 1', async () => {
    const doc = await mdToTiptap('# Hello');
    // { type: 'doc', content: [ { type: 'heading', attrs: { level: 1 }, content: [...] } ] }
    const first = doc.content?.[0];
    expect(first?.type).toBe('heading');
    const level = first && first.type === 'heading' ? (first as TTElement).attrs?.level : undefined;
    expect(level).toBe(1);
  });

  it('Tiptap → Markdown: heading JSON becomes # text', async () => {
    const doc: TiptapDoc = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Sub' }] },
      ],
    } as const;

    const md = await tiptapToMd(doc);
    expect(await normalizeMd(md)).toBe('## Sub');
  });

  it('Round-trip: md → tt → md is equivalent', async () => {
    const input = `# Title

## Subtitle
`;
    const normalized = await normalizeMd(input);
    const rt = await (async () => {
      const doc = await mdToTiptap(input);
      const out = await tiptapToMd(doc);
      return normalizeMd(out);
    })();
    expect(rt).toBe(normalized);
  });
});