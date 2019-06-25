import * as vscode from 'vscode';
import { MarkPlanLinkProvider } from './modules/vscode/MarkPlanLinkProvider';
import {
  MarkPlanTextDocumentContentProvider,
  AGGREGATES_ACTION,
  NEWEST_ACTION,
  OLDEST_ACTION,
  LOCAL_TODOS_ACTION,
  GLOBAL_TODOS_ACTION
} from './modules/vscode/MarkPlanTextDocumentContentProvider';

export function activate(context: vscode.ExtensionContext) {
  const myScheme = 'markplan';
  const linkProvider = new MarkPlanLinkProvider();

  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(
      { language: 'markdown', scheme: 'file' },
      linkProvider
    )
  );
  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(
      { language: 'markdown', scheme: myScheme },
      linkProvider
    )
  );

  const openCommands = [
    { command: 'extension.openAggregates', action: AGGREGATES_ACTION },
    { command: 'extension.openNewest', action: NEWEST_ACTION },
    { command: 'extension.openOldest', action: OLDEST_ACTION },
    { command: 'extension.openLocalTodos', action: LOCAL_TODOS_ACTION },
    { command: 'extension.openGlobalTodos', action: GLOBAL_TODOS_ACTION }
  ];

  openCommands.forEach(({ command, action }) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(command, async () => {
        const uri = vscode.Uri.parse(`${myScheme}:${action}`);
        const doc = await vscode.workspace.openTextDocument(uri);
        vscode.languages.setTextDocumentLanguage(doc, 'markdown');

        const activeUri =
          vscode.window.activeTextEditor &&
          vscode.window.activeTextEditor.document.uri;
        if (
          activeUri &&
          activeUri.scheme === uri.scheme &&
          activeUri.path === uri.path
        ) {
          myProvider.update(uri);
        } else {
          await vscode.window.showTextDocument(doc, { preview: false });
        }
      })
    );
  });

  const myProvider = new MarkPlanTextDocumentContentProvider();
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider)
  );
}

export function deactivate() {}
