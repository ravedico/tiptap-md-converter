export type LogLevel = 'warn' | 'error' | 'info';

let muted = false;

export function setMutedLogging(mute: boolean) {
  muted = mute;
}

export function log(level: LogLevel, message: string, ...args: unknown[]) {
  if (muted) return;
  console[level](`[tiptap-md] ${message}`, ...args);
}