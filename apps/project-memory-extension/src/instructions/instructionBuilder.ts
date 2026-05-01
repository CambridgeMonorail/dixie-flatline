import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { MemoryStore } from '../memory/memoryStore';
import { MemoryPage } from '../memory/types';

export class InstructionBuilder {
  constructor(private readonly store: MemoryStore) {}

  async build(root: string): Promise<string> {
    const pages = await this.store.list(root);
    const eligible = pages
      .filter((page) => page.frontmatter.importance === 'critical' || page.frontmatter.importance === 'high')
      .filter((page) => !page.frontmatter.supersededBy.length)
      .sort((a, b) => instructionPriority(b) - instructionPriority(a));
    const decisions = eligible.filter((page) => page.frontmatter.type === 'decision');
    const facts = eligible.filter((page) => page.frontmatter.type === 'fact' || page.frontmatter.type === 'assumption');
    const issues = eligible.filter((page) => page.frontmatter.type === 'known_issue');
    const questions = eligible.filter((page) => page.frontmatter.type === 'question');

    return compact([
      '# Project Instructions for Copilot',
      '',
      section('Key Decisions and Constraints', decisions),
      section('Durable Facts and Assumptions', facts),
      section('Known Issues', issues),
      section('Open Questions', questions),
      '',
      '_Generated from `.llm-wiki/memory/` by Dixie Flatline._'
    ].filter(Boolean).join('\n'));
  }

  async write(root: string): Promise<string> {
    await this.store.initialise(root);
    const output = await this.build(root);
    const target = path.join(root, '.github', 'copilot-instructions.md');
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, output, 'utf8');
    return path.relative(root, target).replace(/\\/g, '/');
  }
}

function section(title: string, pages: MemoryPage[]): string {
  const lines = pages.flatMap((page) => toBullets(page)).slice(0, 12);

  if (lines.length === 0) {
    return '';
  }

  return [`## ${title}`, '', ...lines, ''].join('\n');
}

function toBullets(page: MemoryPage): string[] {
  const lines = [`- ${page.summary} (${page.path})`];

  if (page.entry.type === 'decision' && 'constraints' in page.entry) {
    lines.push(...page.entry.constraints.slice(0, 4).map((constraint: string) => `- Constraint: ${constraint} (${page.path})`));
    lines.push(...page.entry.antiPatterns.slice(0, 3).map((antiPattern: string) => `- Avoid: ${antiPattern} (${page.path})`));
  }

  return lines;
}

function compact(value: string): string {
  const words = value.split(/\s+/);

  if (words.length <= 1200) {
    return value.endsWith('\n') ? value : `${value}\n`;
  }

  return `${words.slice(0, 1200).join(' ')}\n`;
}

function instructionPriority(page: MemoryPage): number {
  const importance = { critical: 40, high: 20, low: 0 }[page.frontmatter.importance];
  const confidence = { high: 20, medium: 10, low: 0 }[page.frontmatter.confidence];
  const freshness = page.frontmatter.lastVerifiedAt ? 10 : 0;

  return importance + confidence + freshness;
}
