import globby from 'globby';

import { currentActiveWorkspace } from '../vscode';
import { getRgPath } from '../ripgrep-vscode';
import * as ripgrep from '../ripgrep';

const regex = '((//|#|<!--|;|/\\*)\\s*($TAGS)|^\\s*- \\[ \\])';
export async function todosSearch(dir: string): Promise<ripgrep.Match[]> {
  const options = {
    regex: `\"${regex}\"`,
    rgPath: getRgPath(),
    globs: []
  };

  return ripgrep.search(dir, options);
}

export interface MarkdownFile {
  path: string;
  mtime: string;
  group?: string;
}

export async function markdownFilesSearch(): Promise<Array<MarkdownFile>> {
  const files = await globby(['**/*.md'], {cwd: currentActiveWorkspace(), stats: true});
  return files as unknown as Array<MarkdownFile>;
}
