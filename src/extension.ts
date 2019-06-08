import * as vscode from 'vscode';
import {MarkdownLinkProvider} from './MarkdownLinkProvider';

export function activate(context: vscode.ExtensionContext) {
  // registerLinkProvider('markdown', new MarkdownDocumentLinkProvider());
  console.log('Congratulations, your extension "markplan" is now active!');

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
}

export function deactivate() {}
