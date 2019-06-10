// rewrite of https://github.com/Gruntfuggly/todo-tree/blob/1ed8bd593d2012bf06c47bf878925f95ea998f27/ripgrep.js
// which is a rewrite of https://github.com/alexlafroscia/ripgrep-js/blob/c131a2294b5311059f8164fbeec0bd2e301fd86a/index.js

import fs from 'fs';
import { exec, ChildProcess } from 'child_process';

let currentProcess: ChildProcess | undefined;

interface SearchOpts {
  regex: string;
  string?: string;
  globs: string[];
  rgPath: string;
  additional?: string;
  multiline?: boolean;
  filename?: string;
  maxBuffer?: number;
}

/**
 * @method ripGrep
 * @param {string} cwd
 * @param {object|string} options if a string is provided, it will be used as the `searchTerm`
 * @param {string} options.regex a regex pattern to search for. See `-e` option
 * @param {string} options.string a fixed string to search for. See `-F` option
 * @param {Array<string>} option.globs a set of globs to include/exclude. See `-g` option
 * @param {string} [searchTerm]
 */
export async function search(cwd: string, options: SearchOpts, searchTerm?: string): Promise<Match[]> {
  if (!cwd) {
    return Promise.reject({ error: 'No `cwd` provided' });
  }

  options.regex = options.regex || '';
  options.globs = options.globs || [];
  options.string = searchTerm || options.string || '';
  options.additional = options.additional || '';
  options.maxBuffer = options.maxBuffer || 200;

  let rgPath = options.rgPath;
  const isWin = /^win/.test(process.platform);

  if (!fs.existsSync(rgPath)) {
    return Promise.reject({
      error: `ripgrep executable not found (${rgPath})`
    });
  }

  if (!fs.existsSync(cwd)) {
    return Promise.reject({ error: `root folder not found (${cwd})` });
  }

  if (isWin) {
    rgPath = `"${rgPath}"`;
  } else {
    rgPath = rgPath.replace(/ /g, '\\ ');
  }

  let execString =
    `${rgPath} --no-messages --vimgrep -H --column --line-number --color never ${options.additional}`;

  if (options.multiline) {
    execString += ' -U ';
  }

  if (options.regex) {
    execString = `${execString} -e ${options.regex}`;
  } else if (options.string) {
    execString = `${execString} -F ${options.string}`;
  }

  execString = options.globs.reduce((command, glob) => {
    return `${command} -g \"${glob}\"`;
  }, execString);

  if (options.filename) {
    let filename = options.filename;
    if (isWin && filename.slice(-1) === '\\') {
      filename = filename.substr(0, filename.length - 1);
    }
    execString += ' "' + filename + '"';
  } else {
    execString += ' .';
  }

  return new Promise(function(resolve, reject) {
    const maxBuffer = options.maxBuffer! * 1024;
    currentProcess = exec(execString, { cwd, maxBuffer });
    let results = '';

    currentProcess.stdout!.on('data', data => {
      results += data;
    });

    currentProcess.stderr!.on('data', data => {
      reject(new RipgrepError(data, ''));
    });

    currentProcess.on('close', () => {
      resolve(formatResults(results));
    });
  });
}

export function kill() {
  if (currentProcess !== undefined) {
    currentProcess.kill('SIGINT');
  }
}

export class Match {
  file: string = '';
  line: number;
  column: number;
  match: string;
  extraLines: Match[] | undefined;

  constructor(matchText: string) {
    if (matchText.length > 1 && matchText[1] === ':') {
      this.file = matchText.substr(0, 2);
      matchText = matchText.substr(2);
    }

    const matchText2 = matchText.split(':');
    this.file += matchText2.shift();
    this.line = parseInt(matchText2.shift()!);
    this.column = parseInt(matchText2.shift()!);
    this.match = matchText2.join(':');
  }
}

function formatResults(stdout: string) {
  stdout = stdout.trim();

  if (!stdout) {
    return [];
  }

  return stdout.split('\n').map(line => new Match(line));
}

class RipgrepError {
  message: Error;

  constructor(error: Error, public stderr: string) {
    this.message = error;
  }
}

