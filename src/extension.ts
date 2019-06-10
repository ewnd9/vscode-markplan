import * as vscode from 'vscode';
import {MarkdownLinkProvider} from './MarkdownLinkProvider';
import {CatCodingPanel} from './TodoPreview';
import { Editor } from './Editor';
import { search } from './modules/search';

export function activate(context: vscode.ExtensionContext) {
  const disposable0 = vscode.commands.registerCommand('extension.helloWorld', () => {
    vscode.window.showInformationMessage('Hello Test!');
  });
  context.subscriptions.push(disposable0);

  const disposable1 = vscode.languages.registerDocumentLinkProvider({ language: 'markdown', scheme: 'file' }, new MarkdownLinkProvider());
  context.subscriptions.push(disposable1);

  const disposable2 = vscode.commands.registerCommand('extension.helloWorld2', () => {
    vscode.window.showInformationMessage('Hello Test!');
  });
  context.subscriptions.push(disposable2);

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.openWebview', () => {
      CatCodingPanel.createOrShow(context.extensionPath);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.openTree', async () => {
      // Editor.open();
      const uri = vscode.Uri.parse('cowsay:test');
      const doc = await vscode.workspace.openTextDocument(uri);

      await vscode.window.showTextDocument(doc, { preview: false });
    })
  );

  const myScheme = 'cowsay';
  const myProvider = new class implements vscode.TextDocumentContentProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
      const matches = await search();
      return matches.map(match => `${match.file}:${match.line}:\n${match.match}`).join('\n\n');
    }
  };

  context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider));

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(CatCodingPanel.viewType, {
      async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
        console.log(`Got state: ${state}`);
        CatCodingPanel.revive(webviewPanel, context.extensionPath);
      }
    });
  }
}

export function deactivate() {}
