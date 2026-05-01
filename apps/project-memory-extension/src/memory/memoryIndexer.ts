import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { MemoryStore } from './memoryStore';
import { FileMapIndex } from './types';

export class MemoryIndexer {
  constructor(private readonly store: MemoryStore) {}

  async rebuild(root: string): Promise<FileMapIndex> {
    await this.store.initialise(root);
    const pages = await this.store.list(root);
    const index: FileMapIndex = {
      generatedAt: new Date().toISOString(),
      files: {}
    };

    for (const page of pages) {
      for (const relatedFile of page.frontmatter.relatedFiles) {
        index.files[relatedFile] ??= [];
        index.files[relatedFile].push(page.path);
      }
    }

    const indexPath = path.join(root, '.llm-wiki', 'index', 'file-map.json');
    await fs.mkdir(path.dirname(indexPath), { recursive: true });
    await fs.writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
    return index;
  }
}
