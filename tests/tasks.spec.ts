import { describe, it, expect } from 'vitest';
import { mdToTiptap } from '@/markdown-core/md-to-tiptap';
import { tiptapToMd } from '@/markdown-core/tiptap-to-md';
import { normalizeMd } from './helpers/normalize';

describe('Task list plugin', () => {
  it('Round-trip for GFM tasks', async () => {
    const input = `- [ ] todo
- [x] done`;
    const out = await (async () => {
      const doc = await mdToTiptap(input);
      const md = await tiptapToMd(doc);
      return normalizeMd(md);
    })();
    expect(out).toBe(await normalizeMd(input));
  });
});