// src/markdown-core/utils.ts
import type { TTNode, TTTextNode, TTElement, TTMark } from "./types";

/**
 * Type guards
 */
function isText(n: TTNode): n is TTTextNode {
  return n.type === "text" && "text" in n;
}

function isElement(n: TTNode): n is TTElement {
  return n.type !== "text";
}

/**
 * Apply a given mark to all descendant text nodes.
 */
export function applyMarkDeep(
  nodes: TTNode[] | undefined,
  mark: TTMark
): TTNode[] {
  if (!nodes) return [];
  const apply = (n: TTNode): TTNode => {
    if (isText(n)) {
      const marks = n.marks ? [...n.marks, mark] : [mark];
      return { ...n, marks };
    }
    if (isElement(n) && n.content) {
      return { ...n, content: n.content.map(apply) };
    }
    return n;
  };
  return nodes.map(apply);
}

/**
 * Return the mark instance if a text node has a mark of a certain type.
 */
export function hasMark(node: TTNode, type: string): TTMark | undefined {
  if (!isText(node) || !node.marks) return undefined;
  return node.marks.find((m) => m.type === type);
}

/**
 * Remove a mark type from a text node (no-op for non-text nodes).
 */
export function removeMark(node: TTNode, type: string): TTNode {
  if (!isText(node) || !node.marks) return node;
  const marks = node.marks.filter((m) => m.type !== type);
  return { ...node, marks: marks.length ? marks : undefined };
}