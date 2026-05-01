import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { createFrontmatter, parseMemoryMarkdown } from './markdown';
import { MemoryPage } from './types';

const memoryFiles = [
  ['architecture.md', 'fact', 'Architecture', 'Durable facts about the repository architecture.'],
  ['decisions.md', 'decision', 'Decisions', 'Critical and high-impact decisions that should guide Copilot behavior.'],
  ['conventions.md', 'decision', 'Conventions', 'Behavioral constraints and coding conventions for this repository.'],
  ['domain-model.md', 'fact', 'Domain Model', 'Core domain concepts and claims.'],
  ['testing.md', 'fact', 'Testing', 'Durable facts about the testing strategy.'],
  ['known-issues.md', 'known_issue', 'Known Issues', 'Known issues that should remain visible to agents.'],
  ['open-questions.md', 'question', 'Open Questions', 'Unresolved questions that should not be hidden.']
] as const;

export class MemoryStore {
  async initialise(root: string): Promise<void> {
    await fs.mkdir(this.memoryDir(root), { recursive: true });
    await fs.mkdir(path.join(root, '.llm-wiki', 'sources', 'pr-notes'), { recursive: true });
    await fs.mkdir(path.join(root, '.llm-wiki', 'sources', 'issue-notes'), { recursive: true });
    await fs.mkdir(path.join(root, '.llm-wiki', 'sources', 'extracted-symbols'), { recursive: true });
    await fs.mkdir(path.join(root, '.llm-wiki', 'index'), { recursive: true });
    await fs.mkdir(path.join(root, '.github', 'instructions'), { recursive: true });

    for (const [fileName, type, title, summary] of memoryFiles) {
      const target = path.join(this.memoryDir(root), fileName);

      if (await exists(target)) {
        continue;
      }

      await fs.writeFile(
        target,
        `${createFrontmatter({
          id: fileName.replace(/\.md$/, ''),
          type,
          title,
          summary,
          confidence: 'medium',
          importance: type === 'decision' ? 'high' : 'low',
          createdAt: new Date().toISOString().slice(0, 10),
          lastUpdatedAt: new Date().toISOString().slice(0, 10),
          lastVerifiedAt: undefined,
          relatedFiles: [],
          tags: [],
          sources: [],
          supersedes: [],
          supersededBy: []
        })}\n# ${title}\n\n## Summary\nAdd durable project knowledge here.\n`,
        'utf8'
      );
    }
  }

  async list(root: string): Promise<MemoryPage[]> {
    const dir = this.memoryDir(root);

    if (!(await exists(dir))) {
      return [];
    }

    const files = await fs.readdir(dir);
    const pages = await Promise.all(
      files
        .filter((file) => file.endsWith('.md'))
        .map(async (file) => {
          const absolute = path.join(dir, file);
          const raw = await fs.readFile(absolute, 'utf8');
          return parseMemoryMarkdown(path.relative(root, absolute).replace(/\\/g, '/'), raw);
        })
    );

    return pages.sort((a, b) => a.path.localeCompare(b.path));
  }

  async appendDecision(root: string, input: {
    title: string;
    summary?: string;
    context: string;
    decision: string;
    consequences: string;
    constraints?: string[];
    antiPatterns?: string[];
    relatedFiles?: string[];
    tags?: string[];
    confidence?: 'high' | 'medium' | 'low';
    importance?: 'critical' | 'high' | 'low';
    sources?: string[];
    supersedes?: string[];
  }): Promise<string> {
    await this.initialise(root);
    const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const target = path.join(this.memoryDir(root), `decision-${slug}.md`);
    const today = new Date().toISOString().slice(0, 10);
    const entry = [
      createFrontmatter({
        id: slug,
        type: 'decision',
        title: input.title,
        summary: input.summary || input.decision,
        createdAt: today,
        lastUpdatedAt: today,
        lastVerifiedAt: today,
        confidence: input.confidence ?? 'medium',
        importance: input.importance ?? 'high',
        relatedFiles: input.relatedFiles ?? [],
        tags: input.tags ?? [],
        sources: input.sources ?? [],
        supersedes: input.supersedes ?? [],
        supersededBy: []
      }),
      `# ${input.title}`,
      '',
      '## Summary',
      input.summary || input.decision,
      '',
      '## Context',
      input.context,
      '',
      '## Decision',
      input.decision,
      '',
      '## Consequences',
      input.consequences,
      '',
      '## Constraints',
      ...(input.constraints?.length ? input.constraints.map((constraint) => `- ${constraint}`) : ['- None recorded.']),
      '',
      '## Anti-Patterns',
      ...(input.antiPatterns?.length ? input.antiPatterns.map((antiPattern) => `- ${antiPattern}`) : ['- None recorded.']),
      ''
    ].join('\n');

    await fs.writeFile(target, entry, 'utf8');
    return path.relative(root, target).replace(/\\/g, '/');
  }

  memoryDir(root: string): string {
    return path.join(root, '.llm-wiki', 'memory');
  }
}

async function exists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}
