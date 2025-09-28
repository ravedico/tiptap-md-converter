// src/markdown-core/normalize.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import type { Options as RemarkStringifyOptions } from 'remark-stringify';

/**
 * Canonical Markdown style for your project
 * (stable output → less “jitter” on round-trips)
 */
export const MD_STYLE: RemarkStringifyOptions = {
  bullet: '-',                // use "-" for unordered lists
  listItemIndent: 'one',      // 1 space after the bullet
  incrementListMarker: false, // make all ordered items "1."
  fence: '`',                 // code fences use backticks
  fences: true,               // always use fenced code blocks
  emphasis: '*',              // *italic* (not _italic_)
  strong: '*',                // **bold**
  rule: '-',                  // horizontal rule uses "-"
  ruleRepetition: 3,          // exactly three
  ruleSpaces: false,          // '---' (no spaces)
  resourceLink: true,         // prefer [text](url) over <url>
  setext: false,              // always '#' headings (no setext)
};

/**
 * Normalize Markdown text to the canonical style.
 */
export async function normalizeMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkStringify, MD_STYLE)
    .process(markdown);

  // Normalize line endings and trim trailing junk
  return String(file)
    .replace(/\r\n?/g, '\n')   // CRLF → LF
    .replace(/[ \t]+$/gm, '')  // trim trailing spaces
    .replace(/\s+$/g, '\n');   // single trailing newline
}

/**
 * Are two Markdown strings equivalent after normalization?
 */
export async function areMarkdownEquivalent(a: string, b: string): Promise<boolean> {
  return (await normalizeMarkdown(a)) === (await normalizeMarkdown(b));
}

/**
 * Convenience passthrough: normalize a Tiptap doc JSON.
 * (Re-exported here so callers only import from one file if they prefer.)
 */
export { normalizeTiptapDoc } from './normalize-tiptap';