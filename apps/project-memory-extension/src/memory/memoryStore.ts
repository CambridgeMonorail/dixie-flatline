import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { createFrontmatter, parseMemoryMarkdown } from './markdown';
import { MemoryPage } from './types';

const memoryFiles = [
  ['architecture.md', 'architecture', 'Architecture'],
  ['decisions.md', 'decision', 'Decisions'],
  ['conventions.md', 'convention', 'Conventions'],
  ['domain-model.md', 'domain', 'Domain Model'],
  ['testing.md', 'testing', 'Testing'],
  ['known-issues.md', 'issue', 'Known Issues']
] as const;

export class MemoryStore {
  async initialise(root: string): Promise<void> {
    await fs.mkdir(this.memoryDir(root), { recursive: true });
    await fs.mkdir(path.join(root, '.llm-wiki', 'sources', 'pr-notes'), { recursive: true });
    await fs.mkdir(path.join(root, '.llm-wiki', 'sources', 'issue-notes'), { recursive: true });
    await fs.mkdir(path.join(root, '.llm-wiki', 'sources', 'extracted-symbols'), { recursive: true });
    await fs.mkdir(path.join(root, '.llm-wiki', 'index'), { recursive: true });
    await fs.mkdir(path.join(root, '.github', 'instructions'), { recursive: true });

    for (const [fileName, type, title] of memoryFiles) {
      const target = path.join(this.memoryDir(root), fileName);

      if (await exists(target)) {
        continue;
      }

      await fs.writeFile(
        target,
        `${createFrontmatter({
          id: fileName.replace(/\.md$/, ''),
          type,
          status: type === 'decision' ? 'living' : undefined,
          confidence: 'medium',
          last_reviewed: new Date().toISOString().slice(0, 10),
          related_files: [],
          tags: []
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

  async appendDecision(root: string, input: { title: string; context: string; decision: string; consequences: string }): Promise<string> {
    await this.initialise(root);
    const target = path.join(this.memoryDir(root), 'decisions.md');
    const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const entry = [
      '',
      `## ${input.title}`,
      '',
      `- id: ${slug}`,
      '- status: proposed',
      `- last_reviewed: ${new Date().toISOString().slice(0, 10)}`,
      '',
      '### Context',
      input.context,
      '',
      '### Decision',
      input.decision,
      '',
      '### Consequences',
      input.consequences,
      ''
    ].join('\n');

    await fs.appendFile(target, entry, 'utf8');
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
