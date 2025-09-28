import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import type { Options as RemarkStringifyOptions } from 'remark-stringify';

export async function normalizeMd(md: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkStringify, {
      bullet: '-',            // normalize bullets to '-'
      fences: true,           // use code fences
      rule: '-',              // normalize hr
      listItemIndent: 'one',  // stable list indentation
    } as RemarkStringifyOptions)
    .process(md);
  return String(file).trim();
}