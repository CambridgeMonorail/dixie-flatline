export type MemoryType = 'decision' | 'fact' | 'assumption' | 'known_issue' | 'question';

export type Confidence = 'high' | 'medium' | 'low';

export type Importance = 'critical' | 'high' | 'low';

export interface MemoryFrontmatter {
  id: string;
  type: MemoryType;
  title: string;
  summary: string;
  relatedFiles: string[];
  tags: string[];
  createdAt: string;
  lastUpdatedAt: string;
  lastVerifiedAt?: string;
  confidence: Confidence;
  importance: Importance;
  sources: string[];
  supersedes: string[];
  supersededBy: string[];
}

export interface DecisionEntry extends MemoryFrontmatter {
  type: 'decision';
  context: string;
  decision: string;
  consequences: string;
  constraints: string[];
  antiPatterns: string[];
}

export interface Claim {
  text: string;
  sourceId: string;
  confidence: Confidence;
  createdAt: string;
}

export interface FactEntry extends MemoryFrontmatter {
  type: 'fact';
  claims: Claim[];
}

export interface QuestionEntry extends MemoryFrontmatter {
  type: 'question';
  question: string;
  status: 'open' | 'investigating' | 'resolved';
}

export type MemoryEntry = MemoryFrontmatter | DecisionEntry | FactEntry | QuestionEntry;

export interface MemoryPage {
  path: string;
  title: string;
  summary: string;
  frontmatter: MemoryFrontmatter;
  entry: MemoryEntry;
  body: string;
  raw: string;
}

export interface MemorySearchResult {
  page: MemoryPage;
  score: number;
  reasons: string[];
  excerpt: string;
  stale: boolean;
}

export interface FileMapIndex {
  generatedAt: string;
  files: Record<string, string[]>;
}

export interface MemorySearchOptions {
  limit?: number;
  includeLowImportance?: boolean;
  freshnessThresholdDays?: number;
}
