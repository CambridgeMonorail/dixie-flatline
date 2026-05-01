import * as path from 'node:path';
import { normalizePath } from '../pathUtils';
import { MemoryStore } from './memoryStore';
import { MemoryPage, MemorySearchResult } from './types';

export class MemorySearch {
  constructor(private readonly store: MemoryStore) {}

  async search(root: string, query: string, limit = 5): Promise<MemorySearchResult[]> {
    const pages = await this.store.list(root);
    const terms = tokenize(query);
    const results = pages.map((page) => scorePage(page, terms, query)).filter((result) => result.score > 0);

    return results.sort((a, b) => b.score - a.score || a.page.path.localeCompare(b.page.path)).slice(0, limit);
  }

  async getRelevantContext(root: string, filePath: string, limit = 5): Promise<MemorySearchResult[]> {
    const relativePath = path.isAbsolute(filePath) ? normalizePath(path.relative(root, filePath)) : normalizePath(filePath);
    return this.search(root, relativePath, limit);
  }

  async getRelevantDecisions(root: string, filePath: string, limit = 5): Promise<MemorySearchResult[]> {
    const results = await this.getRelevantContext(root, filePath, limit * 2);
    return results.filter((result) => result.page.frontmatter.type === 'decision').slice(0, limit);
  }
}

function scorePage(page: MemoryPage, terms: string[], rawQuery: string): MemorySearchResult {
  const reasons: string[] = [];
  let score = 0;
  const queryPath = normalizePath(rawQuery.toLowerCase());
  const haystack = `${page.title}\n${page.body}`.toLowerCase();

  for (const relatedFile of page.frontmatter.related_files) {
    if (matchesPattern(queryPath, relatedFile.toLowerCase())) {
      score += 30;
      reasons.push(`related_files matches ${relatedFile}`);
    }
  }

  for (const tag of page.frontmatter.tags) {
    if (terms.includes(tag.toLowerCase())) {
      score += 12;
      reasons.push(`tag ${tag}`);
    }
  }

  for (const term of terms) {
    if (page.path.toLowerCase().includes(term)) {
      score += 8;
      reasons.push(`path contains ${term}`);
    }

    const occurrences = countOccurrences(haystack, term);
    if (occurrences > 0) {
      score += Math.min(occurrences, 6);
    }
  }

  if (score > 0 && reasons.length === 0) {
    reasons.push('text similarity');
  }

  return {
    page,
    score,
    reasons,
    excerpt: excerpt(page.body, terms)
  };
}

function tokenize(value: string): string[] {
  return Array.from(new Set(value.toLowerCase().match(/[a-z0-9][a-z0-9_-]{2,}/g) ?? []));
}

function matchesPattern(filePath: string, pattern: string): boolean {
  const normalized = normalizePath(pattern);

  if (normalized.endsWith('/**')) {
    return filePath.startsWith(normalized.slice(0, -3));
  }

  if (normalized.includes('*')) {
    const escaped = normalized.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*');
    return new RegExp(`^${escaped}$`).test(filePath);
  }

  return filePath === normalized || filePath.includes(normalized);
}

function countOccurrences(value: string, term: string): number {
  let count = 0;
  let offset = 0;

  while (true) {
    const index = value.indexOf(term, offset);
    if (index === -1) {
      return count;
    }
    count += 1;
    offset = index + term.length;
  }
}

function excerpt(body: string, terms: string[]): string {
  const lines = body.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const match = lines.find((line) => terms.some((term) => line.toLowerCase().includes(term)));
  return (match ?? lines[0] ?? '').slice(0, 280);
}
