import { MemoryFrontmatter, MemoryPage, MemoryType } from './types';

const validTypes = new Set<MemoryType>(['architecture', 'decision', 'convention', 'domain', 'testing', 'issue', 'note']);

export function parseMemoryMarkdown(filePath: string, raw: string): MemoryPage {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const frontmatter = match ? parseFrontmatter(match[1]) : {};
  const body = match ? match[2].trim() : raw.trim();
  const title = body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? frontmatter.id ?? filePath;

  return {
    path: filePath,
    title,
    frontmatter: normalizeFrontmatter(frontmatter, filePath),
    body,
    raw
  };
}

export function createFrontmatter(data: MemoryFrontmatter): string {
  const lines = [
    '---',
    `id: ${data.id}`,
    `type: ${data.type}`,
    data.status ? `status: ${data.status}` : undefined,
    data.confidence ? `confidence: ${data.confidence}` : undefined,
    data.last_reviewed ? `last_reviewed: ${data.last_reviewed}` : undefined,
    'related_files:',
    ...data.related_files.map((entry) => `  - ${entry}`),
    'tags:',
    ...data.tags.map((entry) => `  - ${entry}`),
    '---'
  ].filter(Boolean);

  return `${lines.join('\n')}\n`;
}

function parseFrontmatter(value: string): Partial<MemoryFrontmatter> {
  const output: Record<string, unknown> = {};
  const lines = value.split(/\r?\n/);
  let activeList: string | undefined;

  for (const line of lines) {
    const listItem = line.match(/^\s*-\s+(.+)$/);

    if (listItem && activeList) {
      const current = Array.isArray(output[activeList]) ? output[activeList] as string[] : [];
      current.push(listItem[1].trim());
      output[activeList] = current;
      continue;
    }

    const keyValue = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyValue) {
      continue;
    }

    activeList = undefined;
    const [, key, rawValue] = keyValue;

    if (rawValue === '') {
      output[key] = [];
      activeList = key;
    } else {
      output[key] = rawValue.trim();
    }
  }

  return output as Partial<MemoryFrontmatter>;
}

function normalizeFrontmatter(frontmatter: Partial<MemoryFrontmatter>, filePath: string): MemoryFrontmatter {
  const type = frontmatter.type && validTypes.has(frontmatter.type) ? frontmatter.type : 'note';

  return {
    id: frontmatter.id || filePath.replace(/[^\w-]+/g, '-').replace(/^-|-$/g, ''),
    type,
    status: frontmatter.status,
    confidence: frontmatter.confidence,
    last_reviewed: frontmatter.last_reviewed,
    related_files: Array.isArray(frontmatter.related_files) ? frontmatter.related_files : [],
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : []
  };
}
