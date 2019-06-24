import globby from 'globby';
import { cwd } from '../vscode';

export interface SearchItem {
  path: string;
  mtime: string;
  group?: string;
}

export async function search(): Promise<Array<SearchItem>> {
  const files = await globby(['**/*.md'], {cwd: cwd(), stats: true});
  return files as unknown as Array<SearchItem>;
}
