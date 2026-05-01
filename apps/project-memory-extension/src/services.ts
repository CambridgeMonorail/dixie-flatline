import { DiffAnalyzer } from './diff/diffAnalyzer';
import { InstructionBuilder } from './instructions/instructionBuilder';
import { MemoryIndexer } from './memory/memoryIndexer';
import { MemorySearch } from './memory/memorySearch';
import { MemoryStore } from './memory/memoryStore';

export interface ProjectMemoryServices {
  store: MemoryStore;
  indexer: MemoryIndexer;
  search: MemorySearch;
  diffAnalyzer: DiffAnalyzer;
  instructionBuilder: InstructionBuilder;
}

export function createServices(): ProjectMemoryServices {
  const store = new MemoryStore();
  const indexer = new MemoryIndexer(store);
  const search = new MemorySearch(store);

  return {
    store,
    indexer,
    search,
    diffAnalyzer: new DiffAnalyzer(),
    instructionBuilder: new InstructionBuilder(store)
  };
}
