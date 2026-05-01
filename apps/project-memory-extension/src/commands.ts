import * as vscode from 'vscode';
import { ProjectMemoryServices } from './services';
import { getWorkspaceRoot } from './workspace';

export function registerCommands(context: vscode.ExtensionContext, services: ProjectMemoryServices) {
  context.subscriptions.push(
    vscode.commands.registerCommand('projectMemory.initialise', async () => {
      const root = getWorkspaceRoot();
      await services.store.initialise(root);
      await services.indexer.rebuild(root);
      vscode.window.showInformationMessage('Dixie Flatline memory initialised.');
    }),
    vscode.commands.registerCommand('projectMemory.rebuildIndex', async () => {
      const root = getWorkspaceRoot();
      const index = await services.indexer.rebuild(root);
      vscode.window.showInformationMessage(`Dixie Flatline index rebuilt for ${Object.keys(index.files).length} file mappings.`);
    }),
    vscode.commands.registerCommand('projectMemory.generateInstructions', async () => {
      const root = getWorkspaceRoot();
      await services.store.initialise(root);
      const target = await services.instructionBuilder.write(root);
      vscode.window.showInformationMessage(`Generated ${target}.`);
    }),
    vscode.commands.registerCommand('projectMemory.updateMemoryFromDiff', async () => {
      const diff = await vscode.window.showInputBox({
        title: 'Dixie Flatline: Update Memory from Diff',
        prompt: 'Paste a unified git diff. Dixie Flatline will suggest typed memory updates.',
        ignoreFocusOut: true
      });

      if (!diff) {
        return;
      }

      const result = services.diffAnalyzer.analyze(diff);
      const doc = await vscode.workspace.openTextDocument({
        content: result.toMarkdown(),
        language: 'markdown'
      });
      await vscode.window.showTextDocument(doc);
    })
  );
}
