import { getRgPath } from '../ripgrep-vscode';
import * as ripgrep from '../ripgrep';
import { cwd } from '../vscode';

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

  const searchRoot = `${cwd()}/docs`;
  const matches = await ripgrep.search(searchRoot, options);

  return matches;
}
