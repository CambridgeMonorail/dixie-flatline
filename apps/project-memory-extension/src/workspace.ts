import * as path from 'node:path';
import * as vscode from 'vscode';
import { normalizePath } from './pathUtils';

export function getWorkspaceRoot(): string {
  const folder = vscode.workspace.workspaceFolders?.[0];

  if (!folder) {
    throw new Error('Open a workspace folder before using Project Memory.');
  }

  return folder.uri.fsPath;
}

export function toWorkspaceRelative(filePath: string, root = getWorkspaceRoot()): string {
  if (!path.isAbsolute(filePath)) {
    return normalizePath(filePath);
  }

  return normalizePath(path.relative(root, filePath));
}
