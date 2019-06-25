import * as vscode from 'vscode';

export function cwd(): string {
  const workspaces = vscode.workspace.workspaceFolders;
  const result = workspaces && workspaces[0];

  if (!result) {
    throw new Error('no opened workspaces');
  }

  return result.uri.path;
}

export function currentActiveFile(): string {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    throw new Error('no opened editors');
  }

  return editor.document.fileName;
}

