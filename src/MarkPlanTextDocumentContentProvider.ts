import * as vscode from 'vscode';
import { fetchTextByAction, Action } from './textUtils';

export class MarkPlanTextDocumentContentProvider implements vscode.TextDocumentContentProvider {
  onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
  onDidChange = this.onDidChangeEmitter.event;

  async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
    return fetchTextByAction({action: uri.path as Action});
  }

  update(uri: vscode.Uri) {
    this.onDidChangeEmitter.fire(uri);
  }
}

