// src/App.tsx
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Tiptap Markdown Converter</h1>
      <p>React + TypeScript is set up and running.</p>

      <button onClick={() => setCount((c) => c + 1)}>Clicks: {count}</button>
    </div>
  );
}

export default App;
