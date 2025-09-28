export type DebugLogger = {
    warn: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    time: (label: string) => void;
    timeEnd: (label: string) => void;
  };
  
  export function createDebugLogger(enabled: boolean): DebugLogger {
    if (!enabled) {
      // no-op logger
      return {
        warn: () => {},
        info: () => {},
        time: () => {},
        timeEnd: () => {},
      };
    }
    return {
      warn: (...args) => console.warn('[converter]', ...args),
      info: (...args) => console.info('[converter]', ...args),
      time: (label) => console.time(`[converter] ${label}`),
      timeEnd: (label) => console.timeEnd(`[converter] ${label}`),
    };
  }