import type { MdPlugin, MdNode, TTNode, ConvertCtx, MdList, MdListItem } from "../types";

const list: MdPlugin = {
  name: "list",
  priority: 10,

  supportsMd(node: MdNode) {
    return node.type === "list";
  },

  toTiptap(node: MdNode, ctx: ConvertCtx) {
    const md = node as MdList;
    const items: TTNode[] = (md.children ?? []).map((li: MdListItem) => ({
      type: "listItem",
      content: ctx.mapMdChildren(li.children),
    }));
    return md.ordered
      ? { type: "orderedList", attrs: { start: md.start ?? 1 }, content: items }
      : { type: "bulletList", content: items };
  },

  fromTiptap(node: TTNode, ctx: ConvertCtx) {
    if (node.type !== "bulletList" && node.type !== "orderedList") return null;
    const children = (node.content ?? []).map((li) => ({
      type: "listItem",
      spread: false,
      children: ctx.mapTiptapChildren(li.content),
    }));
    return {
      type: "list",
      ordered: node.type === "orderedList",
      start: node.type === "orderedList" ? (node.attrs?.start ?? 1) : undefined,
      spread: false,
      children,
    };
  },
};

export default list;