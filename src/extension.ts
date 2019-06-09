import * as vscode from 'vscode';
import {MarkdownLinkProvider} from './MarkdownLinkProvider';
import {CatCodingPanel} from './TodoPreview';

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
    vscode.commands.registerCommand('catCoding.start', () => {
      console.log('here')
      CatCodingPanel.createOrShow(context.extensionPath);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('catCoding.doRefactor', () => {
      if (CatCodingPanel.currentPanel) {
        CatCodingPanel.currentPanel.doRefactor();
      }
    })
  );

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
