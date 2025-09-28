// src/markdown-core/plugins/_template.ts
import { type MdPlugin, type MdNode, type TTNode, type ConvertCtx } from "../types";

const templatePlugin: MdPlugin = {
  name: "RENAME_ME",
  priority: 50,

  // mdast -> tiptap
  supportsMd(node: MdNode) {
    // Use the parameter so TS doesn't flag it as unused in the template
    return node.type === "REPLACE_ME"; // ← change to your mdast node type check
  },
  toTiptap(_node: MdNode, _ctx: ConvertCtx) {
    // Touch params to silence noUnusedParameters until you implement
    void _node; void _ctx;
    return null; // return TTNode | TTNode[] | null
  },

  // tiptap -> mdast
  fromTiptap(_node: TTNode, _ctx: ConvertCtx) {
    // Touch params to silence noUnusedParameters until you implement
    void _node; void _ctx;
    return null; // return MdNode | MdNode[] | null
  },
};

export default templatePlugin;