import { getRgPath } from '../ripgrep-vscode';
import * as ripgrep from '../ripgrep';

const regex = '((//|#|<!--|;|/\\*)\\s*($TAGS)|^\\s*- \\[ \\])';
export async function search(dir: string): Promise<ripgrep.Match[]> {
  const options = {
    regex: `\"${regex}\"`,
    rgPath: getRgPath(),
    globs: []
  };

  // options.additional = c.ripgrepArgs;
  // options.maxBuffer = c.ripgrepMaxBuffer;
  // options.multiline = utils.getRegexSource().indexOf('\\n') > -1;

  console.log(dir)
  return ripgrep.search(dir, options);
}
