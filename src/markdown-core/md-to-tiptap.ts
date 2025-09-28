import { plugins as defaultPlugins } from './registry';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { MdPlugin, TiptapDoc, TTNode, ConvertCtx, MdNode } from './types';
import { asArray, flatCompact, pickPluginForMd, mdDefaultToTiptap } from './walkers';

export type MdToTiptapOptions = {
  plugins?: MdPlugin[];
  onWarn?: (msg: string) => void;
};

export function mdToTiptap(markdown: string, options: MdToTiptapOptions = {}): TiptapDoc {
  const { plugins: overridePlugins } = options;
  const activePlugins = overridePlugins ?? defaultPlugins;

  const processor = unified().use(remarkParse).use(remarkGfm);
  const mdast = processor.parse(markdown) as unknown as MdNode;

  const convert = (node: MdNode): TTNode[] => {
    const plugin = pickPluginForMd(node, ctx, activePlugins);
    if (plugin) {
      const out = plugin.toTiptap?.(node, ctx);
      if (out) return asArray(out);
    }
  
    const defaultMdToTT =
      mdDefaultToTiptap as unknown as (
        n: MdNode,
        conv: (n: MdNode) => TTNode[]
      ) => TTNode | TTNode[] | null;
  
    return asArray(defaultMdToTT(node, convert));
  };

  const ctx: ConvertCtx = {
    mapMdChildren: (children?: MdNode[]) => (children ?? []).flatMap(n => convert(n)),
    mapTiptapChildren: () => { throw new Error("not used in md→tiptap"); },
    tiptapInlineToMd: () => { throw new Error("only used in tiptap→md"); },
  };

  const content = flatCompact([convert(mdast as MdNode)]);
  return { type: 'doc', content };
}