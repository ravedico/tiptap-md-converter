// src/markdown-core/index.ts

// Core converters & public types
export * from "./md-to-tiptap";
export * from "./tiptap-to-md";
export * from "./types"; // use regular export to support TS <5 environments

// Registry exports
export { plugins, registerPlugins, clearPlugins } from "./registry";

export * from "./types";
export * from "./md-to-tiptap";
export * from "./tiptap-to-md";

// Built-in plugins
import type { MdPlugin } from "./types";
import { registerPlugins as _register } from "./registry";

// Import all built-in plugins (default exports)
import heading from "./plugins/heading";
import bold from "./plugins/bold";
import italic from "./plugins/italic";
import strike from "./plugins/strike";
import codeInline from "./plugins/code-inline";
import link from "./plugins/link";
import codeBlock from "./plugins/code-block";
import blockquote from "./plugins/blockquote";
import list from "./plugins/list";
import table from "./plugins/table";
import taskList from "./plugins/task-list";

/**
 * Registers the built-in plugins (add more here as you implement them).
 */
export function registerDefaultPlugins() {
  const all: MdPlugin[] = [
    heading as MdPlugin,
    bold as MdPlugin,
    italic as MdPlugin,
    codeInline as MdPlugin,
    link as MdPlugin,
    codeBlock as MdPlugin,
    blockquote as MdPlugin,
    list as MdPlugin,
    table as MdPlugin,
    taskList as MdPlugin,
    strike as MdPlugin,
  ];
  _register(all.filter(Boolean));
}
