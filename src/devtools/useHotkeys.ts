import { useEffect } from 'react';

export function useHotkeys(bindings: Record<string, () => void>) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const key = `${e.altKey ? 'Alt+' : ''}${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`;
      const action = bindings[key];
      if (action) {
        e.preventDefault();
        action();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [bindings]);
}