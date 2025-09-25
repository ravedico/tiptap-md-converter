import TipTapEditor from './editor/TipTapEditor';

function App() {
  return (
    <main style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Tiptap ↔ Markdown Converter — Playground</h1>
      <p style={{ opacity: 0.8 }}>
        Step 1 sanity check: the Tiptap editor should work and respond to the toolbar.
      </p>
      <TipTapEditor />
    </main>
  );
}

export default App;