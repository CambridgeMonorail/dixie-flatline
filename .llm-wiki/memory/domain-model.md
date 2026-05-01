---
id: project-memory-domain-model
type: domain
status: living
confidence: medium
last_reviewed: 2026-05-01
related_files:
  - apps/project-memory-extension/src/memory/**
tags:
  - domain
  - memory-page
---

# Domain Model

## Summary
- A `MemoryPage` is one Markdown file with frontmatter, title, body, raw content, and repository-relative path.
- `MemoryFrontmatter` records type, status, confidence, tags, and related file globs.
- `MemorySearchResult` includes score, reasons, excerpt, and source page.
- `FileMapIndex` maps related file globs to memory page paths.
