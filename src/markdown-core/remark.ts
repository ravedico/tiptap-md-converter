// src/markdown-core/remark.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import type { Root } from 'mdast';

/** Markdown text -> Remark AST (Root) */
export function mdToRemarkAst(markdown: string): Root {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(markdown) as Root;

  return tree;
}

/** Remark AST (Root) -> Markdown text */
export function remarkAstToMd(tree: Root): string {
  // Order matters: enable GFM *before* stringify so it configures the compiler.
  const file = unified()
    .use(remarkGfm)
    .use(remarkStringify, {
      bullet: '-',            // Use "-" for unordered lists
      listItemIndent: 'one',  // Cleaner list indentation
      fences: true,           // Use ``` for code blocks
      fence: '`',             // Backtick as fence char
      strong: '*',            // Bold as **text**
      rule: '-',              // Horizontal rule as ---
      ruleSpaces: false,      // No spaces around ---
    })
    .stringify(tree);

  return String(file);
}