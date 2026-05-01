import { describe, expect, it } from 'vitest';
import { MemorySearch } from './memorySearch';
import { MemoryStore } from './memoryStore';

describe('MemorySearch', () => {
  it('scores related file matches above text-only matches', async () => {
    const store = {
      list: async () => [
        {
          path: '.llm-wiki/memory/decisions.md',
          title: 'Auth Decision',
          summary: 'Server-owned refresh tokens.',
          body: 'Server-owned refresh tokens.',
          raw: '',
          frontmatter: {
            id: 'auth',
            type: 'decision',
            title: 'Auth Decision',
            summary: 'Server-owned refresh tokens.',
            relatedFiles: ['apps/control-panel-ui/src/auth/**'],
            tags: ['auth'],
            createdAt: '2026-05-01',
            lastUpdatedAt: '2026-05-01',
            lastVerifiedAt: '2026-05-01',
            confidence: 'high',
            importance: 'critical',
            sources: [],
            supersedes: [],
            supersededBy: []
          }
        },
        {
          path: '.llm-wiki/memory/conventions.md',
          title: 'Conventions',
          summary: 'Auth components use strict typing.',
          body: 'Auth components use strict typing.',
          raw: '',
          frontmatter: {
            id: 'conventions',
            type: 'fact',
            title: 'Conventions',
            summary: 'Auth components use strict typing.',
            relatedFiles: [],
            tags: [],
            createdAt: '2026-05-01',
            lastUpdatedAt: '2026-05-01',
            lastVerifiedAt: '2026-05-01',
            confidence: 'medium',
            importance: 'high',
            sources: [],
            supersedes: [],
            supersededBy: []
          }
        }
      ],
      initialise: async () => undefined
    } as unknown as MemoryStore;
    const search = new MemorySearch(store);

    const results = await search.getRelevantContext('/repo', 'apps/control-panel-ui/src/auth/session.ts');

    expect(results[0].page.title).toBe('Auth Decision');
  });
});
