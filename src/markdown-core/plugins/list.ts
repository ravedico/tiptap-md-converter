import type {
  MdPlugin,
  MdNode,
  TTNode,
  ConvertCtx,
  MdList,
  MdListItem,
  TTElement,
} from "../types";

const list: MdPlugin = {
  name: "list",
  priority: 10,

  supportsMd(node: MdNode) {
    return node.type === "list";
  },

  toTiptap(node: MdNode, ctx: ConvertCtx): TTElement {
    const md = node as MdList;
    const items: TTElement[] = (md.children ?? []).map((li) => ({
      type: "listItem",
      content: ctx.mapMdChildren(li.children),
    }));

    const attrs: Record<string, unknown> | undefined =
      typeof md.start === "number" && md.start > 1 ? { start: md.start } : undefined;

    const result: TTElement = md.ordered
      ? (attrs ? { type: "orderedList", attrs, content: items } : { type: "orderedList", content: items })
      : { type: "bulletList", content: items };

    return result;
  },

  fromTiptap(node: TTNode, ctx: ConvertCtx) {
    if (node.type !== "bulletList" && node.type !== "orderedList") return null;

    const children: MdListItem[] = (node.content ?? []).map((li) => ({
      type: "listItem",
      spread: false,
      children: ctx.mapTiptapChildren((li as TTElement).content ?? []),
    }));

    return {
      type: "list",
      ordered: node.type === "orderedList",
      start:
        node.type === "orderedList"
          ? ((node as TTElement).attrs?.start as number | undefined) ?? 1
          : undefined,
      spread: false,
      children,
    };
  },
};

export default list;