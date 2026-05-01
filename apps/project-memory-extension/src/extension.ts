import * as vscode from 'vscode';
import { createServices } from './services';
import { registerChatParticipant } from './chat/chatHandler';
import { registerCommands } from './commands';
import { registerTools } from './tools/toolProvider';

export function activate(context: vscode.ExtensionContext) {
  const services = createServices();

  registerCommands(context, services);
  registerChatParticipant(context, services);
  registerTools(context, services);
}

export function deactivate() {}
