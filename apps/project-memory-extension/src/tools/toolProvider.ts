import * as vscode from 'vscode';
import { DiffAnalysis } from '../diff/diffAnalyzer';
import { ProjectMemoryServices } from '../services';
import { getWorkspaceRoot } from '../workspace';

type SearchInput = { query: string };
type FileInput = { filePath: string };
type DecisionInput = { title: string; context: string; decision: string; consequences: string };
type DiffInput = { diff: string };

export function registerTools(context: vscode.ExtensionContext, services: ProjectMemoryServices) {
  const registrations: [string, vscode.LanguageModelTool<object>][] = [
    ['project-memory_searchProjectMemory', new SearchProjectMemoryTool(services) as vscode.LanguageModelTool<object>],
    ['project-memory_getRelevantContext', new RelevantContextTool(services) as vscode.LanguageModelTool<object>],
    ['project-memory_getRelevantDecisions', new RelevantDecisionsTool(services) as vscode.LanguageModelTool<object>],
    ['project-memory_recordDecision', new RecordDecisionTool(services) as vscode.LanguageModelTool<object>],
    ['project-memory_updateMemoryFromDiff', new UpdateMemoryFromDiffTool(services) as vscode.LanguageModelTool<object>],
    ['project-memory_generateCopilotInstructions', new GenerateInstructionsTool(services) as vscode.LanguageModelTool<object>]
  ];

  for (const [name, tool] of registrations) {
    context.subscriptions.push(vscode.lm.registerTool(name, tool));
  }
}

class SearchProjectMemoryTool implements vscode.LanguageModelTool<SearchInput> {
  constructor(private readonly services: ProjectMemoryServices) {}

  async invoke(options: vscode.LanguageModelToolInvocationOptions<SearchInput>) {
    const root = getWorkspaceRoot();
    await this.services.store.initialise(root);
    const results = await this.services.search.search(root, options.input.query);
    return textResult(formatSearchResults(results));
  }
}

class RelevantContextTool implements vscode.LanguageModelTool<FileInput> {
  constructor(private readonly services: ProjectMemoryServices) {}

  async invoke(options: vscode.LanguageModelToolInvocationOptions<FileInput>) {
    const root = getWorkspaceRoot();
    await this.services.store.initialise(root);
    const results = await this.services.search.getRelevantContext(root, options.input.filePath);
    return textResult(formatSearchResults(results));
  }
}

class RelevantDecisionsTool implements vscode.LanguageModelTool<FileInput> {
  constructor(private readonly services: ProjectMemoryServices) {}

  async invoke(options: vscode.LanguageModelToolInvocationOptions<FileInput>) {
    const root = getWorkspaceRoot();
    await this.services.store.initialise(root);
    const results = await this.services.search.getRelevantDecisions(root, options.input.filePath);
    return textResult(formatSearchResults(results));
  }
}

class RecordDecisionTool implements vscode.LanguageModelTool<DecisionInput> {
  constructor(private readonly services: ProjectMemoryServices) {}

  async prepareInvocation(options: vscode.LanguageModelToolInvocationPrepareOptions<DecisionInput>) {
    return {
      invocationMessage: 'Recording project decision',
      confirmationMessages: {
        title: 'Record project decision',
        message: new vscode.MarkdownString(`Record **${options.input.title}** in \`.llm-wiki/memory/decisions.md\`?`)
      }
    };
  }

  async invoke(options: vscode.LanguageModelToolInvocationOptions<DecisionInput>) {
    const root = getWorkspaceRoot();
    const target = await this.services.store.appendDecision(root, options.input);
    await this.services.indexer.rebuild(root);
    return textResult(`Recorded decision in ${target}.`);
  }
}

class UpdateMemoryFromDiffTool implements vscode.LanguageModelTool<DiffInput> {
  constructor(private readonly services: ProjectMemoryServices) {}

  async invoke(options: vscode.LanguageModelToolInvocationOptions<DiffInput>) {
    const analysis = this.services.diffAnalyzer.analyze(options.input.diff);
    return textResult(formatDiffAnalysis(analysis));
  }
}

class GenerateInstructionsTool implements vscode.LanguageModelTool<Record<string, never>> {
  constructor(private readonly services: ProjectMemoryServices) {}

  async prepareInvocation() {
    return {
      invocationMessage: 'Generating Copilot instructions',
      confirmationMessages: {
        title: 'Generate Copilot instructions',
        message: new vscode.MarkdownString('Write `.github/copilot-instructions.md` from `.llm-wiki/memory/`?')
      }
    };
  }

  async invoke() {
    const root = getWorkspaceRoot();
    const target = await this.services.instructionBuilder.write(root);
    return textResult(`Generated ${target}.`);
  }
}

function textResult(value: string): vscode.LanguageModelToolResult {
  return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(value)]);
}

function formatSearchResults(results: Awaited<ReturnType<ProjectMemoryServices['search']['search']>>): string {
  if (results.length === 0) {
    return 'No matching project memory entries found.';
  }

  return results.map((result) => [
    `# ${result.page.title}`,
    `Source: ${result.page.path}`,
    `Score: ${result.score}`,
    `Reasons: ${result.reasons.join(', ') || 'text similarity'}`,
    '',
    result.excerpt
  ].join('\n')).join('\n\n---\n\n');
}

function formatDiffAnalysis(analysis: DiffAnalysis): string {
  return analysis.toMarkdown();
}
