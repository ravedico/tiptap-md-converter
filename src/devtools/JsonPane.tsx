import { useMemo } from 'react';
import { useDev } from '@/devtools/dev-context';

type Props = {
  markdownAst: unknown;   // pass the latest remark AST here
  tiptapDoc: unknown;     // pass the latest tiptap doc here
};

export default function JsonPane({ markdownAst, tiptapDoc }: Props) {
  const { showJsonPane } = useDev();
  const mdText = useMemo(() => safeStringify(markdownAst), [markdownAst]);
  const ttText = useMemo(() => safeStringify(tiptapDoc), [tiptapDoc]);

  if (!showJsonPane) return null;

  return (
    <div style={{
      position: 'fixed', left: 16, bottom: 16, width: 420, height: 320,
      background: 'white', border: '1px solid #ddd', borderRadius: 12,
      boxShadow: '0 8px 24px rgba(0,0,0,.12)', padding: 12, zIndex: 9999,
      display: 'grid', gridTemplateRows: 'auto 1fr auto 1fr', gap: 8, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12
    }}>
      <strong>Markdown AST</strong>
      <pre style={{ margin: 0, overflow: 'auto', whiteSpace: 'pre-wrap' }}>{mdText}</pre>
      <strong>Tiptap JSON</strong>
      <pre style={{ margin: 0, overflow: 'auto', whiteSpace: 'pre-wrap' }}>{ttText}</pre>
    </div>
  );
}

function safeStringify(v: unknown): string {
  try { return JSON.stringify(v, replacer, 2); }
  catch { return '[unserializable]'; }
}

function replacer(_k: string, value: unknown) {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value instanceof Set) return Array.from(value);
  return value as unknown;
}