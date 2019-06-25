import * as vscode from 'vscode';
import {MarkdownLinkProvider} from './MarkdownLinkProvider';
import {CatCodingPanel} from './TodoPreview';
import {AGGREGATES_ACTION, NEWEST_ACTION, OLDEST_ACTION, LOCAL_TODOS_ACTION, GLOBAL_TODOS_ACTION} from './textUtils';
import {MarkPlanTextDocumentContentProvider} from './MarkPlanTextDocumentContentProvider';

export function activate(context: vscode.ExtensionContext) {
  const myScheme = 'cowsay';

  const disposable0 = vscode.commands.registerCommand('extension.helloWorld', () => {
    vscode.window.showInformationMessage('Hello Test!');
  });
  context.subscriptions.push(disposable0);

  const linkProvider = new MarkdownLinkProvider();

  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider({ language: 'markdown', scheme: 'file' }, linkProvider)
  );
  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider({ language: 'markdown', scheme: myScheme }, linkProvider)
  );

  const disposable2 = vscode.commands.registerCommand('extension.helloWorld2', () => {
    vscode.window.showInformationMessage('Hello Test!');
  });
  context.subscriptions.push(disposable2);

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.openWebview', () => {
      CatCodingPanel.createOrShow(context.extensionPath);
    })
  );

  const openCommands = [
    {command: 'extension.openAggregates', action: AGGREGATES_ACTION},
    {command: 'extension.openNewest', action: NEWEST_ACTION},
    {command: 'extension.openOldest', action: OLDEST_ACTION},
    {command: 'extension.openLocalTodos', action: LOCAL_TODOS_ACTION},
    {command: 'extension.openGlobalTodos', action: GLOBAL_TODOS_ACTION},
  ];

  openCommands.forEach(({command, action}) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(command, async () => {
        const uri = vscode.Uri.parse(`${myScheme}:${action}`);
        const doc = await vscode.workspace.openTextDocument(uri);
        vscode.languages.setTextDocumentLanguage(doc, 'markdown');

        const activeUri = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri;
        if (activeUri && activeUri.scheme === uri.scheme && activeUri.path === uri.path) {
          myProvider.update(uri);
        } else {
          await vscode.window.showTextDocument(doc, { preview: false });
        }

      })
    );
  });

  const myProvider = new MarkPlanTextDocumentContentProvider();
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
