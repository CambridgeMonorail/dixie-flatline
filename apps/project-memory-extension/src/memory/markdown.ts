import { Claim, Confidence, Importance, MemoryEntry, MemoryFrontmatter, MemoryPage, MemoryType } from './types';

const validTypes = new Set<MemoryType>(['decision', 'fact', 'assumption', 'known_issue', 'question']);
const validConfidence = new Set<Confidence>(['high', 'medium', 'low']);
const validImportance = new Set<Importance>(['critical', 'high', 'low']);

export function parseMemoryMarkdown(filePath: string, raw: string): MemoryPage {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const frontmatter = match ? parseFrontmatter(match[1]) : {};
  const body = match ? match[2].trim() : raw.trim();
  const title = asString(frontmatter.title) || body.match(/^#\s+(.+)$/m)?.[1]?.trim() || asString(frontmatter.id) || filePath;
  const summary = asString(frontmatter.summary) || extractSection(body, 'Summary') || firstContentLine(body);
  const normalized = normalizeFrontmatter(frontmatter, filePath, title, summary);
  const entry = buildEntry(normalized, body);

  return {
    path: filePath,
    title,
    summary,
    frontmatter: normalized,
    entry,
    body,
    raw
  };
}

export function createFrontmatter(data: MemoryFrontmatter): string {
  const lines = [
    '---',
    `id: ${data.id}`,
    `type: ${data.type}`,
    `title: ${data.title}`,
    `summary: ${data.summary}`,
    `createdAt: ${data.createdAt}`,
    `lastUpdatedAt: ${data.lastUpdatedAt}`,
    data.lastVerifiedAt ? `lastVerifiedAt: ${data.lastVerifiedAt}` : undefined,
    `confidence: ${data.confidence}`,
    `importance: ${data.importance}`,
    'relatedFiles:',
    ...data.relatedFiles.map((entry) => `  - ${entry}`),
    'tags:',
    ...data.tags.map((entry) => `  - ${entry}`),
    'sources:',
    ...data.sources.map((entry) => `  - ${entry}`),
    'supersedes:',
    ...data.supersedes.map((entry) => `  - ${entry}`),
    'supersededBy:',
    ...data.supersededBy.map((entry) => `  - ${entry}`),
    '---'
  ].filter(Boolean);

  return `${lines.join('\n')}\n`;
}

function parseFrontmatter(value: string): Record<string, unknown> {
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

  return output;
}

function normalizeFrontmatter(frontmatter: Record<string, unknown>, filePath: string, title: string, summary: string): MemoryFrontmatter {
  const rawType = asString(frontmatter.type);
  const type = normalizeType(rawType);
  const today = new Date().toISOString().slice(0, 10);
  const confidence = normalizeConfidence(asString(frontmatter.confidence));
  const importance = normalizeImportance(asString(frontmatter.importance));

  return {
    id: asString(frontmatter.id) || filePath.replace(/[^\w-]+/g, '-').replace(/^-|-$/g, ''),
    type,
    title,
    summary,
    relatedFiles: arrayValue(frontmatter.relatedFiles ?? frontmatter.related_files),
    tags: arrayValue(frontmatter.tags),
    createdAt: asString(frontmatter.createdAt ?? frontmatter.created_at) || today,
    lastUpdatedAt: asString(frontmatter.lastUpdatedAt ?? frontmatter.last_updated_at ?? frontmatter.last_reviewed) || today,
    lastVerifiedAt: asString(frontmatter.lastVerifiedAt ?? frontmatter.last_verified_at ?? frontmatter.last_reviewed),
    confidence,
    importance,
    sources: arrayValue(frontmatter.sources),
    supersedes: arrayValue(frontmatter.supersedes),
    supersededBy: arrayValue(frontmatter.supersededBy ?? frontmatter.superseded_by)
  };
}

function buildEntry(frontmatter: MemoryFrontmatter, body: string): MemoryEntry {
  if (frontmatter.type === 'decision') {
    return {
      ...frontmatter,
      type: 'decision',
      context: extractSection(body, 'Context'),
      decision: extractSection(body, 'Decision'),
      consequences: extractSection(body, 'Consequences'),
      constraints: listSection(body, 'Constraints'),
      antiPatterns: listSection(body, 'Anti-Patterns')
    };
  }

  if (frontmatter.type === 'fact') {
    return {
      ...frontmatter,
      type: 'fact',
      claims: claimsFromSection(body, frontmatter.id)
    };
  }

  if (frontmatter.type === 'question') {
    return {
      ...frontmatter,
      type: 'question',
      question: extractSection(body, 'Question') || frontmatter.summary,
      status: normalizeQuestionStatus(extractInlineValue(body, 'status'))
    };
  }

  return frontmatter;
}

function normalizeType(type: string): MemoryType {
  const mapped = {
    architecture: 'fact',
    convention: 'decision',
    domain: 'fact',
    testing: 'fact',
    issue: 'known_issue',
    note: 'fact'
  }[type] ?? type;

  return validTypes.has(mapped as MemoryType) ? mapped as MemoryType : 'fact';
}

function normalizeConfidence(value: string): Confidence {
  return validConfidence.has(value as Confidence) ? value as Confidence : 'low';
}

function normalizeImportance(value: string): Importance {
  return validImportance.has(value as Importance) ? value as Importance : 'low';
}

function normalizeQuestionStatus(value: string): 'open' | 'investigating' | 'resolved' {
  return value === 'investigating' || value === 'resolved' ? value : 'open';
}

function arrayValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  return [];
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function extractSection(body: string, title: string): string {
  const pattern = new RegExp(`##+\\s+${escapeRegExp(title)}\\s*\\r?\\n([\\s\\S]*?)(?=\\r?\\n##+\\s+|$)`, 'i');
  return body.match(pattern)?.[1]?.trim() ?? '';
}

function listSection(body: string, title: string): string[] {
  return extractSection(body, title)
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);
}

function claimsFromSection(body: string, sourceId: string): Claim[] {
  const claims = listSection(body, 'Claims');
  const createdAt = new Date().toISOString().slice(0, 10);

  return claims.map((text) => ({
    text,
    sourceId,
    confidence: 'medium',
    createdAt
  }));
}

function extractInlineValue(body: string, key: string): string {
  return body.match(new RegExp(`^-\\s*${escapeRegExp(key)}:\\s*(.+)$`, 'im'))?.[1]?.trim() ?? '';
}

function firstContentLine(body: string): string {
  return body
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*#]\s*/, '').trim())
    .find(Boolean) ?? '';
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
