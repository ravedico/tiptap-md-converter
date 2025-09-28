// src/markdown-core/tiptap-to-md.ts
import { plugins as defaultPlugins } from './registry';
import { unified } from 'unified';
import remarkStringify from 'remark-stringify';
import type { Options as RemarkStringifyOptions } from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import type { Root } from 'mdast';
import type { MdPlugin, TiptapDoc, TTNode, ConvertCtx, MdNode } from './types';
import { asArray, flatCompact, pickPluginForTiptap, tiptapDefaultToMd } from './walkers';

export type TiptapToMdOptions = {
  plugins?: MdPlugin[];
  stringify?: RemarkStringifyOptions;
  onWarn?: (msg: string) => void;
};

export function tiptapToMd(doc: TiptapDoc, options: TiptapToMdOptions = {}): string {
  const { plugins: overridePlugins, stringify } = options;
  const activePlugins = overridePlugins ?? defaultPlugins;

  const ctx: ConvertCtx = {
    mapMdChildren: () => { throw new Error('not used in tiptap→md'); },
    mapTiptapChildren: (children?: TTNode[]) => (children ?? []).flatMap(n => convert(n)),
    tiptapInlineToMd: (textNode) => ({ type: 'text', value: textNode.text ?? '' }),
  };

  const convert = (node: TTNode): MdNode[] => {
    const plugin = pickPluginForTiptap(node, ctx, activePlugins);
    if (plugin) {
      const out = plugin.fromTiptap?.(node, ctx);
      if (out) return asArray(out) as MdNode[];
    }

    const defaultTTToMd = tiptapDefaultToMd as unknown as (
      n: TTNode,
      conv: (n: TTNode) => MdNode[]
    ) => MdNode | MdNode[] | null;

    return asArray(defaultTTToMd(node, convert)) as MdNode[];
  };

  const mdRoot = {
    type: 'root',
    children: flatCompact((doc.content ?? []).map(convert)) as MdNode[],
  } as unknown as Root;

  const processor = unified().use(remarkGfm).use(remarkStringify, stringify ?? { fences: true });
  return processor.stringify(mdRoot);
}