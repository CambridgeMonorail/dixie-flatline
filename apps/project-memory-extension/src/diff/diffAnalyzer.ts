export type DiffClassification = 'architectural' | 'behavioural' | 'refactor';

export class DiffAnalysis {
  constructor(
    readonly files: string[],
    readonly classification: DiffClassification,
    readonly important: boolean,
    readonly suggestions: string[]
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

    return new DiffAnalysis(files, classification, important, suggestions);
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
    return [`Review whether .llm-wiki/memory/architecture.md or decisions.md should mention changes affecting ${fileList}.`];
  }

  if (classification === 'behavioural') {
    return [`Review whether conventions.md, domain-model.md, or testing.md should describe the behavior changed in ${fileList}.`];
  }

  return [`Check whether the refactor changed naming or layout conventions in ${fileList}.`];
}
