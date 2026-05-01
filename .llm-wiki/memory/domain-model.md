---
id: structured-memory-domain-model
type: fact
title: Structured memory domain model
summary: Memory entries are typed Markdown documents with schema metadata plus type-specific body sections.
createdAt: 2026-05-01
lastUpdatedAt: 2026-05-01
lastVerifiedAt: 2026-05-01
confidence: high
importance: high
relatedFiles:
  - apps/project-memory-extension/src/memory/types.ts
  - apps/project-memory-extension/src/memory/markdown.ts
tags:
  - schema
  - domain-model
sources:
  - Spec Update - From Wiki to Intelligence Layer
supersedes:
  - project-memory-domain-model
supersededBy:
---

# Structured memory domain model

## Summary
Memory entries are typed Markdown documents with schema metadata plus type-specific body sections.

## Claims
- `MemoryType` is limited to `decision`, `fact`, `assumption`, `known_issue`, and `question`.
- Every memory entry includes timestamps, confidence, importance, tags, related files, sources, and supersession fields.
- Decision entries add context, decision, consequences, constraints, and anti-patterns.
- Fact entries can contain multiple claims rather than pretending competing facts are resolved.
- Question entries preserve unknowns with open, investigating, or resolved status.
