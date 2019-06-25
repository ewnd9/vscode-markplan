import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import chunk from 'lodash/chunk';

import distanceInWordsStrict from 'date-fns/distance_in_words_strict';
import { MarkdownFile } from './modules/search';
import * as ripgrep from './modules/ripgrep';

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

export function formatAggregates(matches: Array<MarkdownFile>) {
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

export function formatNewest(matches: Array<MarkdownFile>) {
  return formatOrdered(matches, 'desc');
}

export function formatOldest(matches: Array<MarkdownFile>) {
  return formatOrdered(matches, 'asc');
}

async function formatOrdered(matches: Array<MarkdownFile>, order: 'asc' | 'desc') {
  const targets = orderBy(matches, 'mtime', order);

  return chunk(targets.slice(0, 50), 5).map(items => formatFiles(items)).join('\n\n');
}

export function formatTodos(todos: ripgrep.Match[]) {
  const groups = groupBy(todos, 'file');

  return Object.entries(groups)
    .map(([file, todos]) => `## ${file}\n\n${todos.map(todo => todo.match).join('\n')}`)
    .join('\n\n');
}

function formatFiles(items: Array<MarkdownFile>) {
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
