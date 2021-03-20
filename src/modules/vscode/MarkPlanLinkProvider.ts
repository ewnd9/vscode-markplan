import path from 'path';
import * as vscode from 'vscode';
import lineColumn from 'line-column';
import { currentActiveWorkspace } from '.';
import { parseLinks } from '../../textUtils';

// https://github.com/microsoft/vscode/blob/81d7885dc2e9dc617e1522697a2966bc4025a45d/extensions/markdown-language-features/src/features/documentLinkProvider.ts
// https://github.com/microsoft/vscode/blob/c1c3e5eab0f2fb9e04a32b4fc6473023a9c25697/extensions/markdown-language-features/src/commands/openDocumentLink.ts
// https://github.com/microsoft/vscode/blob/aa575b1e8a3d83df2abd61753077f9d33b9d3c0d/extensions/vscode-api-tests/src/singlefolder-tests/languages.test.ts
export class MarkPlanLinkProvider implements vscode.DocumentLinkProvider {
  provideDocumentLinks(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentLink[]> {
    const source = document.getText();
    const liner = lineColumn(source, {
      origin: 0
    });

    return parseLinks({source}).map(({start, end, path: filePath}) => {
      const startPosition = liner.fromIndex(start);
      const endPosition = liner.fromIndex(
        end === source.length ? (end - 1) : end
      );

      let destPath;

      if (filePath.startsWith('/')) {
        destPath = path.resolve(currentActiveWorkspace(), filePath.substring(1));
      } else {
        destPath = path.resolve(path.dirname(document.fileName), filePath);
      }

      return new vscode.DocumentLink(
        new vscode.Range(
          new vscode.Position(startPosition.line, startPosition.col),
          new vscode.Position(endPosition.line, endPosition.col),
        ),
        vscode.Uri.file(destPath),
      );
    });
  }
}
