import path from 'path';

import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import chunk from 'lodash/chunk';

import distanceInWordsStrict from 'date-fns/distance_in_words_strict';
import { search, SearchItem } from './modules/globby';
import { search as searchTodos } from './modules/search';
import { cwd, currentActiveFile } from './modules/vscode';

export const AGGREGATES_ACTION = 'AGGREGATES_ACTION';
export const NEWEST_ACTION = 'NEWEST_ACTION';
export const OLDEST_ACTION = 'OLDEST_ACTION';
export const LOCAL_TODOS_ACTION = 'LOCAL_TODOS_ACTION';
export const GLOBAL_TODOS_ACTION = 'GLOBAL_TODOS_ACTION';

const mapper = {
  [AGGREGATES_ACTION]: fetchAggregates,
  [NEWEST_ACTION]: fetchNewest,
  [OLDEST_ACTION]: fetchOldest,
  [LOCAL_TODOS_ACTION]: fetchLocalTodos,
  [GLOBAL_TODOS_ACTION]: fetchGlobalTodos,
};

export type Action = keyof typeof mapper;

export async function fetchTextByAction({action}: {action: Action}) {
  const fn = mapper[action];

  if (!fn) {
    return 'Unknown action';
  }

  try {
    const content = await fn();
    return `# ${action}\n\n${content}`;
  } catch (err) {
    return `Error: ${err.message}`;
  }
}

interface ParseLinksItem {
  start: number;
  end: number;
  path: string;
}

export function parseLinks({source}: {source: string;}): Array<ParseLinksItem> {
  const regEx = /(?<=(^|\s))(\.)?(\.)?\/[\w\d-_/]*\.md/g;
  const result: Array<ParseLinksItem> = [];

  let match: RegExpExecArray | null;
  while (match = regEx.exec(source)) {
    const start = match.index;
    const end = regEx.lastIndex;
    const path = match[0];
    result.push({start, end, path});
  }

  return result;
}

async function fetchAggregates() {
  const matches = await search();

  const targets = matches
    .filter(match => match.path.includes('--'))
    .map(item => {
      const match = /--([\w-]+)(\.|$)/g.exec(item.path);

      if (!match) {
        throw new Error(`Can't parse /${item.path}`);
      }

      item.group = match[1];
      return item;
    });

  const groups = groupBy(targets, 'group');

  return Object.entries(groups)
    .map(([group, items]) => {
      return `## ${group}\n\n${formatFiles(items)}`;
    })
    .join('\n\n');
}

async function fetchNewest() {
  return fetchOrdered('desc');
}

async function fetchOldest() {
  return fetchOrdered('asc');
}

async function fetchOrdered(order: 'asc' | 'desc') {
  const matches = await search();
  const targets = orderBy(matches, 'mtime', order);

  return chunk(targets.slice(0, 50), 5).map(items => formatFiles(items)).join('\n\n');
}

async function fetchLocalTodos() {
  return fetchTodos(path.dirname(currentActiveFile()));
}

async function fetchGlobalTodos() {
  return fetchTodos(cwd());
}

async function fetchTodos(dir: string) {
  const res = await searchTodos(dir);
  const groups = groupBy(res, 'file');

  return Object.entries(groups)
    .map(([file, todos]) => `## ${file}\n\n${todos.map(todo => todo.match).join('\n')}`)
    .join('\n\n');
}

function formatFiles(items: Array<SearchItem>) {
  return items
    .map(
      target =>
        `- /${target.path} (${distanceInWordsStrict(
          target.mtime,
          Date.now()
        )})`
    )
    .join('\n');
}
