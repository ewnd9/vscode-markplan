import os from 'os';
import fs from 'fs';
import path from 'path';
import assert from 'assert';
import * as vscode from 'vscode';

import {MarkdownLinkProvider} from '../MarkdownLinkProvider';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite('Extension Tests', function() {
  // Defines a Mocha unit test
  test('Something 1', function() {
    assert.equal(-1, [1, 2, 3].indexOf(5));
    assert.equal(-1, [1, 2, 3].indexOf(0));
  });

  // https://github.com/microsoft/vscode/blob/aa575b1e8a3d83df2abd61753077f9d33b9d3c0d/extensions/vscode-api-tests/src/singlefolder-tests/languages.test.ts#L120
  test('Something 1', async function() {
    const uri = await createRandomFile(
      '\n\nTest /CHANGELOG.md\n',
      undefined,
      '.md'
    );

    const doc = await vscode.workspace.openTextDocument(uri);
    const range = new vscode.Range(
      new vscode.Position(2, 5),
      new vscode.Position(2, 18)
    );

    vscode.languages.registerDocumentLinkProvider(
      { language: 'markdown', scheme: 'file' },
      new MarkdownLinkProvider()
    );

    const links = await vscode.commands.executeCommand<vscode.DocumentLink[]>(
      'vscode.executeLinkProvider',
      doc.uri
    );
    console.log('links', links);

    assertEqualRange(links![0].range, range);
  });
});

function assertEqualRange(
  actual: vscode.Range,
  expected: vscode.Range,
  message?: string
) {
  assert.equal(rangeToString(actual), rangeToString(expected), message);
}

function positionToString(p: vscode.Position) {
  return `[${p.character}/${p.line}]`;
}

function rangeToString(r: vscode.Range) {
  return `[${positionToString(r.start)}/${positionToString(r.end)}]`;
}
// https://github.com/microsoft/vscode/blob/aa575b1e8a/extensions/vscode-api-tests/src/utils.ts
function createRandomFile(
  contents = '',
  dir: string = os.tmpdir(),
  ext = ''
): Thenable<vscode.Uri> {
  return new Promise((resolve, reject) => {
    const tmpFile = path.join(dir, rndName() + ext);
    fs.writeFile(tmpFile, contents, error => {
      if (error) {
        return reject(error);
      }

      resolve(vscode.Uri.file(tmpFile));
    });
  });
}

function rndName() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 10);
}
