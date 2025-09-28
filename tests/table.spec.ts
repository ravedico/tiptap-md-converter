import { describe, it, expect } from 'vitest';
import { mdToTiptap } from '@/markdown-core/md-to-tiptap';
import { tiptapToMd } from '@/markdown-core/tiptap-to-md';
import { normalizeMd } from './helpers/normalize';

describe('Table plugin', () => {
  it('GFM table round-trip', async () => {
    const input = `| a | b |
|---|---|
| 1 | 2 |`;
    const doc = await mdToTiptap(input);
    // spot-check the Tiptap JSON shape if you like:
    const table = doc.content?.[0];
    expect(table?.type).toBe('table');

    const out = await tiptapToMd(doc);
    expect(await normalizeMd(out)).toBe(await normalizeMd(input));
  });
});