import type { MdPlugin } from './types';
import heading from './plugins/heading';
import bold from './plugins/bold';
import italic from './plugins/italic';
import strike from './plugins/strike';
import link from './plugins/link';
import codeInline from './plugins/code-inline';
import codeBlock from './plugins/code-block';
import blockquote from './plugins/blockquote';
import bulletList from './plugins/bullet-list';
import orderedList from './plugins/ordered-list';
import listItem from './plugins/list-item';
import table from './plugins/table';
import tableRow from './plugins/table-row';
import tableCell from './plugins/table-cell';
import taskList from './plugins/task-list';
import taskItem from './plugins/task-item';
import text from './plugins/text';

const _plugins: MdPlugin[] = [
  heading,
  bold,
  italic,
  strike,
  link,
  codeInline,
  codeBlock,
  blockquote,
  bulletList,
  orderedList,
  listItem,
  table,
  tableRow,
  tableCell,
  taskList,
  taskItem,
  text,
];

export const plugins = _plugins;

export function registerPlugins(list: MdPlugin[]) {
  _plugins.splice(0, _plugins.length, ...list);
}

export function clearPlugins() {
  _plugins.length = 0;
}