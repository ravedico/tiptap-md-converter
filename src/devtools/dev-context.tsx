import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type DevState = {
  isOpen: boolean;
  setOpen: (v: boolean) => void;

  showJsonPane: boolean;
  setShowJsonPane: (v: boolean) => void;

  trace: boolean;
  setTrace: (v: boolean) => void;

  // plugin enable/disable by name
  enabledPlugins: Record<string, boolean>;
  setEnabledPlugins: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
};

const DevContext = createContext<DevState | undefined>(undefined);

export function DevProvider({
  children,
  initialEnabled,
}: {
  children: ReactNode;
  initialEnabled?: Record<string, boolean>;
}) {
  const [isOpen, setOpen] = useState(false);
  const [showJsonPane, setShowJsonPane] = useState(false);
  const [trace, setTrace] = useState(false);
  const [enabledPlugins, setEnabledPlugins] = useState<Record<string, boolean>>(initialEnabled ?? {});

  const value: DevState = useMemo(
    () => ({
      isOpen,
      setOpen,
      showJsonPane,
      setShowJsonPane,
      trace,
      setTrace,
      enabledPlugins,
      setEnabledPlugins,
    }),
    [isOpen, showJsonPane, trace, enabledPlugins],
  );

  return (
    <DevContext.Provider value={value}>
      {children}
    </DevContext.Provider>
  );
}

// Type guard so TS knows ctx is definitely DevState after the check
function assertDevContext(ctx: DevState | undefined): asserts ctx is DevState {
  if (ctx === undefined) {
    throw new Error('useDev must be used within <DevProvider>');
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDev(): DevState {
  const ctx = useContext(DevContext);
  assertDevContext(ctx);
  return ctx;
}