export type MemoryType = 'architecture' | 'decision' | 'convention' | 'domain' | 'testing' | 'issue' | 'note';

export interface MemoryFrontmatter {
  id: string;
  type: MemoryType;
  status?: string;
  confidence?: 'low' | 'medium' | 'high';
  last_reviewed?: string;
  related_files: string[];
  tags: string[];
}

export interface MemoryPage {
  path: string;
  title: string;
  frontmatter: MemoryFrontmatter;
  body: string;
  raw: string;
}

export interface MemorySearchResult {
  page: MemoryPage;
  score: number;
  reasons: string[];
  excerpt: string;
}

export interface FileMapIndex {
  generatedAt: string;
  files: Record<string, string[]>;
}
