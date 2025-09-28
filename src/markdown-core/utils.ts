// src/markdown-core/utils.ts
import type { TTNode, TTMark } from "./types";

/** Apply a given mark to all descendant text nodes */
export function applyMarkDeep(
  nodes: TTNode[] | undefined,
  mark: TTMark
): TTNode[] {
  if (!nodes) return [];
  const apply = (n: TTNode): TTNode => {
    if (n.type === "text") {
      const marks = n.marks ? [...n.marks, mark] : [mark];
      return { ...n, marks };
    }
    if (n.content) return { ...n, content: n.content.map(apply) };
    return n;
  };
  return nodes.map(apply);
}

/** Return the mark instance if a text node has a mark of a certain type */
export function hasMark(node: TTNode, type: string): TTMark | undefined {
  // Only text nodes can carry marks in Tiptap JSON
  if (node.type !== "text") return undefined;
  const marks = node.marks ?? [];
  return marks.find(m => m.type === type);
}

/** Remove a mark type from a text node (no-op for non-text nodes) */
export function removeMark(node: TTNode, type: string): TTNode {
  // Only text nodes can carry marks in Tiptap JSON
  if (node.type !== "text" || !node.marks) return node;
  const marks = node.marks.filter(m => m.type !== type);
  return { ...node, marks: marks.length ? marks : undefined };
}