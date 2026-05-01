---
id: project-memory-decisions
type: decision
status: living
confidence: high
last_reviewed: 2026-05-01
related_files:
  - apps/project-memory-extension/src/**
tags:
  - memory
  - decisions
---

# Decisions

## Markdown is the source of truth

### Context
The MVP should avoid hosted services, vector databases, and heavyweight RAG infrastructure.

### Decision
Store durable project knowledge as Markdown under `.llm-wiki/memory/` with simple frontmatter.

### Consequences
- Memory is human-readable and version-controlled.
- Search is deterministic in Phase 1.
- Embeddings can be added later without changing the core storage contract.

## Keep VS Code APIs at the extension edge

### Context
Core memory code needs unit tests that run outside the VS Code extension host.

### Decision
Keep `vscode` imports in command, chat, tool, and workspace boundary modules.

### Consequences
- Memory search and parsing remain testable with Vitest.
- Extension-host integration can be verified separately.
