import React from 'react';
import { useDev } from '@/devtools/dev-context';

type Props = {
  plugins: string[]; // plugin names from your registry
};

export default function DevPanel({ plugins }: Props) {
  const { isOpen, setOpen, showJsonPane, setShowJsonPane, trace, setTrace, enabledPlugins, setEnabledPlugins } = useDev();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', right: 16, bottom: 16, width: 320,
      background: 'white', border: '1px solid #ddd', borderRadius: 12,
      boxShadow: '0 8px 24px rgba(0,0,0,.12)', padding: 12, zIndex: 9999, fontFamily: 'ui-sans-serif, system-ui'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong>Dev Panel</strong>
        <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
      </div>

      <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <input type="checkbox" checked={showJsonPane} onChange={e => setShowJsonPane(e.target.checked)} />
        Show JSON/AST pane (Alt+J)
      </label>

      <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input type="checkbox" checked={trace} onChange={e => setTrace(e.target.checked)} />
        Trace conversions (verbose console)
      </label>

      <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>Plugins</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6, maxHeight: 220, overflow: 'auto' }}>
        {plugins.map((name) => {
          const enabled = enabledPlugins[name] ?? true;
          return (
            <React.Fragment key={name}>
              <div title={name} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
              <label style={{ justifySelf: 'end' }}>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setEnabledPlugins(prev => ({ ...prev, [name]: next }));
                  }}
                />
              </label>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.6 }}>
        Hotkeys: Alt+D (panel), Alt+J (JSON/AST)
      </div>
    </div>
  );
}