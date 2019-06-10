import * as vscode from 'vscode';

import { getRgPath } from '../ripgrep-vscode';
import * as ripgrep from '../ripgrep';

const regex = '((//|#|<!--|;|/\\*)\\s*($TAGS)|^\\s*- \\[ \\])';

export async function search(): Promise<ripgrep.Match[]> {
  const options = {
    regex: `\"${regex}\"`,
    rgPath: getRgPath(),
    globs: []
  };

  // options.additional = c.ripgrepArgs;
  // options.maxBuffer = c.ripgrepMaxBuffer;
  // options.multiline = utils.getRegexSource().indexOf('\\n') > -1;

  const workspaces = vscode.workspace.workspaceFolders;

  if (workspaces && workspaces[0]) {
    const searchRoot = `${workspaces[0].uri.path}/docs`;
    const matches = await ripgrep.search(searchRoot, options);

    return matches;
  } else {
    console.log('no workspaces');
  }

  return [];
}
