import { describe, it, expect } from 'vitest';
import { mdToTiptap } from '@/markdown-core/md-to-tiptap';
import { tiptapToMd } from '@/markdown-core/tiptap-to-md';
import { normalizeMd } from './helpers/normalize';

describe('Lists plugins', () => {
  it('Bullet list round-trip', async () => {
    const input = `- a
- b
  - nested`;
    const doc = await mdToTiptap(input);
    const out = await tiptapToMd(doc);
    expect(await normalizeMd(out)).toBe(await normalizeMd(input));
  });

  it('Ordered list round-trip', async () => {
    const input = `1. one
2. two`;
    const doc = await mdToTiptap(input);
    const out = await tiptapToMd(doc);
    expect(await normalizeMd(out)).toBe(await normalizeMd(input));
  });
});