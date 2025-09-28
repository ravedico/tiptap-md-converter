export type ConverterOptions = {
    // Called before/after visiting nodes to log/trace decisions.
    logger?: {
      warn: (...args: unknown[]) => void;
      info: (...args: unknown[]) => void;
      time: (label: string) => void;
      timeEnd: (label: string) => void;
    };
    // If provided, only plugins whose name passes this filter will be considered.
    filterPlugin?: (pluginName: string) => boolean;
    // If true, log extra info about plugin matches.
    trace?: boolean;
  };