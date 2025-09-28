// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import { DevProvider } from './devtools/dev-context';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DevProvider>
      <App />
    </DevProvider>
  </React.StrictMode>
);