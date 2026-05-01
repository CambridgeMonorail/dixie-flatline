import * as vscode from 'vscode';
import { ProjectMemoryServices } from '../services';
import { getWorkspaceRoot } from '../workspace';

export function registerChatParticipant(context: vscode.ExtensionContext, services: ProjectMemoryServices) {
  const handler: vscode.ChatRequestHandler = async (request, _chatContext, stream, token) => {
    const root = getWorkspaceRoot();
    const prompt = request.prompt.trim();
    const maxResults = vscode.workspace.getConfiguration('projectMemory').get<number>('maxSearchResults', 5);
    await services.store.initialise(root);

    if (/update memory|current changes|diff/i.test(prompt)) {
      stream.markdown('Paste a diff into `Project Memory: Update Memory from Diff` to generate deterministic memory suggestions.');
      return { metadata: { command: 'update' } };
    }

    const activeFile = vscode.window.activeTextEditor?.document.uri.fsPath;
    const query = activeFile && /this file|active file|module/i.test(prompt) ? activeFile : prompt;
    const results = /decision/i.test(prompt)
      ? await services.search.getRelevantDecisions(root, query, maxResults)
      : await services.search.search(root, query, maxResults);

    if (token.isCancellationRequested) {
      return {};
    }

    if (results.length === 0) {
      stream.markdown('No matching project memory entries found. Run `Project Memory: Initialise` if this repo has not been set up yet.');
      return { metadata: { command: request.command } };
    }

    stream.markdown(formatResults(results));
    return { metadata: { command: request.command, resultCount: results.length } };
  };

  const participant = vscode.chat.createChatParticipant('project-memory.participant', handler);
  participant.iconPath = new vscode.ThemeIcon('book');
  participant.followupProvider = {
    provideFollowups() {
      return [
        { prompt: 'what decisions affect this module', label: 'Find relevant decisions' },
        { prompt: 'summarise architecture constraints', label: 'Summarise constraints' },
        { prompt: 'explain this file', label: 'Explain active file' }
      ];
    }
  };

  context.subscriptions.push(participant);
}

function formatResults(results: Awaited<ReturnType<ProjectMemoryServices['search']['search']>>): string {
  const lines = ['Here is the relevant project memory:', ''];

  for (const result of results) {
    lines.push(`## ${result.page.title}`);
    lines.push('');
    lines.push(result.excerpt || 'No excerpt available.');
    lines.push('');
    lines.push(`_Source: ${result.page.path}; relevance: ${result.score}; ${result.reasons.join(', ')}_`);
    lines.push('');
  }

  return lines.join('\n');
}
