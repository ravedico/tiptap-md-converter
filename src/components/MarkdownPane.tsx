
type Props = {
  value: string;
  onChange: (next: string) => void;
};

export default function MarkdownPane({ value, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', fontSize: 12, color: '#6b7280' }}>
        Markdown (left) — type here
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        style={{
          flex: 1,
          width: '100%',
          resize: 'none',
          border: 'none',
          outline: 'none',
          padding: 12,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
          fontSize: 14,
          lineHeight: 1.6,
        }}
        placeholder="Type Markdown here…"
      />
    </div>
  );
}