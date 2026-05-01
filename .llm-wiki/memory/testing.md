---
id: deterministic-core-testing
type: fact
title: Deterministic core testing
summary: Vitest covers deterministic memory behavior; extension-host tests are a later release confidence layer.
createdAt: 2026-05-01
lastUpdatedAt: 2026-05-01
lastVerifiedAt: 2026-05-01
confidence: medium
importance: high
relatedFiles:
  - apps/project-memory-extension/src/**/*.spec.ts
tags:
  - vitest
  - testing
sources:
  - apps/project-memory-extension/src/memory/memorySearch.spec.ts
supersedes:
supersededBy:
---

# Deterministic core testing

## Summary
Vitest covers deterministic memory behavior; extension-host tests are a later release confidence layer.

## Claims
- `MemorySearch` verifies related file patterns rank above text-only matches.
- Typecheck, Vitest, and VSIX packaging are the current verification baseline.
- Extension-host tests should be added before depending on UI/chat behavior for release confidence.
