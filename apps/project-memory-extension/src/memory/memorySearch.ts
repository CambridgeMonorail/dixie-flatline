import * as path from 'node:path';
import { normalizePath } from '../pathUtils';
import { MemoryStore } from './memoryStore';
import { MemoryPage, MemorySearchOptions, MemorySearchResult } from './types';

export class MemorySearch {
  constructor(private readonly store: MemoryStore) {}

  async search(root: string, query: string, optionsOrLimit: MemorySearchOptions | number = {}): Promise<MemorySearchResult[]> {
    const options = normalizeOptions(optionsOrLimit);
    const pages = await this.store.list(root);
    const terms = tokenize(query);
    const results = pages
      .filter((page) => options.includeLowImportance || page.frontmatter.importance !== 'low')
      .map((page) => scorePage(page, terms, query, options.freshnessThresholdDays))
      .filter((result) => result.score > 0);

    return results.sort((a, b) => b.score - a.score || a.page.path.localeCompare(b.page.path)).slice(0, options.limit);
  }

  async getRelevantMemory(root: string, filePath: string, optionsOrLimit: MemorySearchOptions | number = {}): Promise<MemorySearchResult[]> {
    const relativePath = path.isAbsolute(filePath) ? normalizePath(path.relative(root, filePath)) : normalizePath(filePath);
    return this.search(root, relativePath, optionsOrLimit);
  }

  async getRelevantContext(root: string, filePath: string, optionsOrLimit: MemorySearchOptions | number = {}): Promise<MemorySearchResult[]> {
    return this.getRelevantMemory(root, filePath, optionsOrLimit);
  }

  async getRelevantDecisions(root: string, filePath: string, optionsOrLimit: MemorySearchOptions | number = {}): Promise<MemorySearchResult[]> {
    const options = normalizeOptions(optionsOrLimit);
    const results = await this.getRelevantMemory(root, filePath, { ...options, limit: options.limit * 3 });
    return results.filter((result) => result.page.frontmatter.type === 'decision').slice(0, options.limit);
  }

  async getCriticalDecisions(root: string, optionsOrLimit: MemorySearchOptions | number = {}): Promise<MemorySearchResult[]> {
    const options = normalizeOptions(optionsOrLimit);
    const pages = await this.store.list(root);

    return pages
      .filter((page) => page.frontmatter.type === 'decision')
      .filter((page) => page.frontmatter.importance === 'critical' || page.frontmatter.importance === 'high')
      .map((page) => scorePage(page, [], page.title, options.freshnessThresholdDays))
      .sort((a, b) => b.score - a.score || a.page.title.localeCompare(b.page.title))
      .slice(0, options.limit);
  }

  async findConflicts(root: string, topic: string, optionsOrLimit: MemorySearchOptions | number = {}): Promise<MemorySearchResult[]> {
    const options = normalizeOptions(optionsOrLimit);
    const results = await this.search(root, topic, { ...options, includeLowImportance: true, limit: options.limit * 3 });
    const topicTerms = tokenize(topic);

    return results
      .filter((result) => result.page.frontmatter.supersedes.length > 0 || result.page.frontmatter.supersededBy.length > 0 || hasCompetingLanguage(result.page, topicTerms))
      .slice(0, options.limit);
  }

  async getOpenQuestions(root: string, optionsOrLimit: MemorySearchOptions | number = {}): Promise<MemorySearchResult[]> {
    const options = normalizeOptions(optionsOrLimit);
    const pages = await this.store.list(root);

    return pages
      .filter((page) => page.frontmatter.type === 'question')
      .filter((page) => !/\bstatus:\s*resolved\b/i.test(page.body))
      .map((page) => scorePage(page, [], page.title, options.freshnessThresholdDays))
      .sort((a, b) => b.score - a.score || a.page.title.localeCompare(b.page.title))
      .slice(0, options.limit);
  }
}

function scorePage(page: MemoryPage, terms: string[], rawQuery: string, freshnessThresholdDays = 90): MemorySearchResult {
  const reasons: string[] = [];
  let score = baseScore(page);
  const queryPath = normalizePath(rawQuery.toLowerCase());
  const haystack = `${page.title}\n${page.summary ?? ''}\n${page.body}`.toLowerCase();
  const stale = isStale(page, freshnessThresholdDays);

  if (stale) {
    score -= 8;
    reasons.push('stale or unverified');
  }

  const relatedFiles = page.frontmatter.relatedFiles ?? [];
  const tags = page.frontmatter.tags ?? [];

  for (const relatedFile of relatedFiles) {
    if (matchesPattern(queryPath, relatedFile.toLowerCase())) {
      score += 50;
      reasons.push(`relatedFiles matches ${relatedFile}`);
    }
  }

  for (const tag of tags) {
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
    reasons.push('importance/confidence/freshness');
  }

  return {
    page,
    score,
    reasons,
    excerpt: excerpt(page.summary ?? page.frontmatter.summary ?? page.title, page.body, terms),
    stale
  };
}

function normalizeOptions(optionsOrLimit: MemorySearchOptions | number): Required<MemorySearchOptions> {
  if (typeof optionsOrLimit === 'number') {
    return {
      limit: optionsOrLimit,
      includeLowImportance: false,
      freshnessThresholdDays: 90
    };
  }

  return {
    limit: optionsOrLimit.limit ?? 5,
    includeLowImportance: optionsOrLimit.includeLowImportance ?? false,
    freshnessThresholdDays: optionsOrLimit.freshnessThresholdDays ?? 90
  };
}

function baseScore(page: MemoryPage): number {
  const importanceScore = {
    critical: 40,
    high: 24,
    low: 5
  }[page.frontmatter.importance ?? 'high'];
  const confidenceScore = {
    high: 20,
    medium: 10,
    low: 0
  }[page.frontmatter.confidence ?? 'medium'];
  const verifiedScore = page.frontmatter.lastVerifiedAt ? 8 : -6;

  return importanceScore + confidenceScore + verifiedScore;
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

function excerpt(summary: string, body: string, terms: string[]): string {
  const lines = [summary, ...body.split(/\r?\n/)].filter((line) => line?.trim().length > 0);
  const match = lines.find((line) => terms.some((term) => line.toLowerCase().includes(term)));
  return (match ?? lines[0] ?? '').slice(0, 280);
}

function isStale(page: MemoryPage, thresholdDays: number): boolean {
  if (!page.frontmatter.lastVerifiedAt) {
    return true;
  }

  const verifiedAt = Date.parse(page.frontmatter.lastVerifiedAt);
  if (Number.isNaN(verifiedAt)) {
    return true;
  }

  const ageMs = Date.now() - verifiedAt;
  return ageMs > thresholdDays * 24 * 60 * 60 * 1000;
}

function hasCompetingLanguage(page: MemoryPage, topicTerms: string[]): boolean {
  const haystack = `${page.title}\n${page.summary}\n${page.body}`.toLowerCase();
  const mentionsTopic = topicTerms.length === 0 || topicTerms.some((term) => haystack.includes(term));
  return mentionsTopic && /\b(conflict|supersed|deprecated|proposed|migrate|instead|do not|avoid)\b/.test(haystack);
}
