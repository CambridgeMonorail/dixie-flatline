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
          body: 'Server-owned refresh tokens.',
          raw: '',
          frontmatter: {
            id: 'auth',
            type: 'decision',
            related_files: ['apps/control-panel-ui/src/auth/**'],
            tags: ['auth']
          }
        },
        {
          path: '.llm-wiki/memory/conventions.md',
          title: 'Conventions',
          body: 'Auth components use strict typing.',
          raw: '',
          frontmatter: {
            id: 'conventions',
            type: 'convention',
            related_files: [],
            tags: []
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
