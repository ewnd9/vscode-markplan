import path from 'path';
import * as vscode from 'vscode';
import lineColumn from 'line-column';
import { cwd } from './modules/vscode';

// https://github.com/microsoft/vscode/blob/81d7885dc2e9dc617e1522697a2966bc4025a45d/extensions/markdown-language-features/src/features/documentLinkProvider.ts
// https://github.com/microsoft/vscode/blob/c1c3e5eab0f2fb9e04a32b4fc6473023a9c25697/extensions/markdown-language-features/src/commands/openDocumentLink.ts
// https://github.com/microsoft/vscode/blob/aa575b1e8a3d83df2abd61753077f9d33b9d3c0d/extensions/vscode-api-tests/src/singlefolder-tests/languages.test.ts
export class MarkdownLinkProvider implements vscode.DocumentLinkProvider {
  provideDocumentLinks(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentLink[]> {
    const source = document.getText();
    const liner = lineColumn(source, {
      origin: 0
    });
    const regEx = /\/.*\.md/g;

    const result: vscode.DocumentLink[] = [];

    let match: RegExpExecArray | null;
    while (match = regEx.exec(source)) {
      const startPosition = liner.fromIndex(match.index);
      const endPosition = liner.fromIndex(
        regEx.lastIndex === source.length ? (regEx.lastIndex - 1) : regEx.lastIndex
      );
      const destPath = path.resolve(cwd(), match[0].substring(1));
      const uri = vscode.Uri.parse(`command:_markdown.openDocumentLink?${encodeURIComponent(JSON.stringify({ path: encodeURIComponent(destPath)}))}`);
      // not working for some reason, probably wrong argument name
      // const uri = vscode.Uri.parse(`command:vscode.open?${encodeURIComponent(JSON.stringify({ resource: vscode.Uri.file(p)}))}`);

      result.push(new vscode.DocumentLink(
        new vscode.Range(
          new vscode.Position(startPosition.line, startPosition.col),
          new vscode.Position(endPosition.line, endPosition.col),
        ),
        uri
      ));
    }

    return result;
  }
}
