import { useEffect, useMemo, useRef, useState } from 'react';
import MarkdownPane from '@/components/MarkdownPane';
import TiptapPane from '@/components/TiptapPane';
import { useDebouncedCallback } from '@/utils/useDebouncedCallback';

// Your converters from previous steps
import { mdToTiptap } from '@/markdown-core/md-to-tiptap';
import { tiptapToMd } from '@/markdown-core/tiptap-to-md';
import { normalizeMarkdown, normalizeTiptapDoc } from '@/markdown-core/normalize';
import type { JSONContent } from '@tiptap/core';
import type { TiptapDoc } from '@/markdown-core/types';
import { useDev } from '@/devtools/dev-context';

const SAMPLE_MD = `# Hello, TipTap ↔ Markdown

- **Bold**
- *Italic*
- ~~Strike~~
- \`Inline code\`
- [A link](https://example.com)

> Blockquote

\`\`\`ts
console.log('code block');
\`\`\`

- [ ] Task (empty)
- [x] Task (done)

| Feature | Works? |
| ------: | :----- |
| Tables  | Yes ✅ |
`;

export default function App() {
  const dev = useDev();
  console.debug('DEV CTX', dev);

  // Left pane (Markdown as text)
  const [markdown, setMarkdown] = useState<string>(SAMPLE_MD);
  const markdownRef = useRef<string>(SAMPLE_MD);

  // Right pane consumes JSON; we keep the last doc we pushed externally
  const [externalDoc, setExternalDoc] = useState<JSONContent | null>(null);
  // Last conversion error (if any)
  const [error, setError] = useState<string | null>(null);

  // A small "last source" marker (for display/debugging; the loop-guard is inside TiptapPane)
  const lastSourceRef = useRef<'markdown' | 'tiptap' | null>(null);

  // Keep a ref of the latest markdown to avoid stale closures in debounced callbacks
  useEffect(() => {
    markdownRef.current = markdown;
  }, [markdown]);

  // Compute the initial Tiptap JSON once (from the sample)
  const initialDoc = useMemo<JSONContent>(() => {
    try {
      return normalizeTiptapDoc(mdToTiptap(SAMPLE_MD)) as JSONContent;
    } catch (e: unknown) {
      console.error(e);
      return { type: 'doc', content: [{ type: 'paragraph' }] } as JSONContent;
    }
  }, []);

  // When Markdown changes (left pane): debounce → convert → push to right pane
  const applyMarkdownToTiptap = useDebouncedCallback(() => {
    try {
      const json = normalizeTiptapDoc(mdToTiptap(markdownRef.current)) as JSONContent;
      setError(null);
      lastSourceRef.current = 'markdown';
      setExternalDoc(json); // TiptapPane will setContent() without emitting update
    } catch (e: unknown) {
      console.error(e);
      setError((e as Error)?.message ?? 'Failed to convert Markdown → Tiptap');
    }
  }, 250);

  // Handler for textarea
  const onMarkdownChange = (next: string) => {
    setMarkdown(next);
    applyMarkdownToTiptap();
  };

  // When Tiptap changes (right pane): convert immediately → update left text
  const onTiptapUserUpdate = (json: JSONContent) => {
    void (async () => {
      try {
        const md = await tiptapToMd(json as unknown as TiptapDoc);
        const mdClean = await normalizeMarkdown(md);
        setError(null);
        lastSourceRef.current = 'tiptap';
        setMarkdown(mdClean);
        // Note: do NOT call setExternalDoc() here — that would bounce back.
      } catch (e: unknown) {
        console.error(e);
        setError((e as Error)?.message ?? 'Failed to convert Tiptap → Markdown');
      }
    })();
  };

  return (
    <div style={{ height: '100vh', display: 'grid', gridTemplateRows: 'auto 1fr', background: '#fff' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderBottom: '1px solid #e5e7eb' }}>
        <strong>Tiptap ↔ Markdown Demo</strong>
        <div style={{ fontSize: 12, color: '#6b7280' }}>
          Last change source: <b>{lastSourceRef.current ?? '—'}</b>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => {
              setMarkdown(SAMPLE_MD);
              try {
                const j = normalizeTiptapDoc(mdToTiptap(SAMPLE_MD)) as JSONContent;
                setExternalDoc(j);
                setError(null);
                lastSourceRef.current = 'markdown';
              } catch {
                setError('Failed to reset sample');
              }
            }}
            style={{
              border: '1px solid #e5e7eb',
              background: '#f9fafb',
              borderRadius: 6,
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            Reset sample
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '8px 12px', borderBottom: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Two panes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 0 }}>
        <div style={{ borderRight: '1px solid #e5e7eb', minHeight: 0 }}>
          <MarkdownPane value={markdown} onChange={onMarkdownChange} />
        </div>
        <div style={{ minHeight: 0 }}>
          <TiptapPane initialDoc={initialDoc} externalDoc={externalDoc} onUserUpdate={onTiptapUserUpdate} />
        </div>
      </div>
    </div>
  );
}