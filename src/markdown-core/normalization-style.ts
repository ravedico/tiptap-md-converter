// src/markdown-core/normalization-style.ts
export const MD_STYLE = {
    bullet: '-',                // Use "-" for unordered lists
    listItemIndent: 'one',       // 1 space after bullet
    incrementListMarker: false,  // Ordered lists: always "1."
    emphasis: '*',               // Italics: *text*
    strong: '*',                 // Bold: **text**
    fence: '`',                  // Code blocks fenced with backticks
    fences: true,                // Always fenced, never indented
    rule: '-',                   // Horizontal rule uses dashes
    ruleRepetition: 3,           // Exactly 3 dashes
    ruleSpaces: false,           // No spaces between dashes
    setext: false,               // Disable setext headings (=== or ---)
    resourceLink: true           // Prefer [text](url) over <url>
  };