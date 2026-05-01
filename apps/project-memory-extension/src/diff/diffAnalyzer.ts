export type DiffClassification = 'architectural' | 'behavioural' | 'refactor';

export class DiffAnalysis {
  constructor(
    readonly files: string[],
    readonly classification: DiffClassification,
    readonly important: boolean,
    readonly suggestions: string[],
    readonly memoryActions: string[]
  ) {}

  toMarkdown(): string {
    return [
      '# Project Memory Diff Analysis',
      '',
      `- Classification: ${this.classification}`,
      `- Important: ${this.important ? 'yes' : 'no'}`,
      '',
      '## Files',
      ...this.files.map((file) => `- ${file}`),
      '',
      '## Suggested Memory Updates',
      ...(this.suggestions.length ? this.suggestions.map((suggestion) => `- ${suggestion}`) : ['- No durable memory update suggested.']),
      '',
      '## Candidate Actions',
      ...(this.memoryActions.length ? this.memoryActions.map((action) => `- ${action}`) : ['- none']),
      ''
    ].join('\n');
  }
}

export class DiffAnalyzer {
  analyze(diff: string): DiffAnalysis {
    const files = Array.from(diff.matchAll(/^\+\+\+\s+b\/(.+)$/gm)).map((match) => match[1]);
    const lower = diff.toLowerCase();
    const classification = classify(lower);
    const important = classification !== 'refactor' || /auth|security|database|api|schema|architecture|decision/.test(lower);
    const suggestions = important ? buildSuggestions(files, classification) : [];
    const memoryActions = important ? buildActions(lower, classification) : [];

    return new DiffAnalysis(files, classification, important, suggestions, memoryActions);
  }
}

function classify(diff: string): DiffClassification {
  if (/architecture|adr|decision|constraint|schema|migration|database|auth|security/.test(diff)) {
    return 'architectural';
  }

  if (/feature|fix|behavior|behaviour|api|command|handler|validation/.test(diff)) {
    return 'behavioural';
  }

  return 'refactor';
}

function buildSuggestions(files: string[], classification: DiffClassification): string[] {
  const fileList = files.slice(0, 5).join(', ') || 'changed files';

  if (classification === 'architectural') {
    return [`Review whether a critical/high decision or fact entry should be added or updated for ${fileList}.`];
  }

  if (classification === 'behavioural') {
    return [`Review whether a behavior-guiding decision, known issue, or question should be added for ${fileList}.`];
  }

  return [`Check whether the refactor supersedes or changes an existing decision for ${fileList}.`];
}

function buildActions(diff: string, classification: DiffClassification): string[] {
  const actions = classification === 'architectural'
    ? ['new decision', 'update existing decision', 'mark decision as superseded']
    : classification === 'behavioural'
      ? ['new fact', 'new known_issue', 'new question']
      : ['update existing fact'];

  if (/todo|fixme|hack|temporary/.test(diff)) {
    actions.push('new known_issue', 'new question');
  }

  return Array.from(new Set(actions));
}
