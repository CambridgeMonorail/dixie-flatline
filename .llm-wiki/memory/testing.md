---
id: project-memory-testing
type: testing
status: living
confidence: medium
last_reviewed: 2026-05-01
related_files:
  - apps/project-memory-extension/src/**/*.spec.ts
tags:
  - vitest
---

# Testing

## Summary
Vitest covers deterministic core behavior. VS Code integration should be tested separately with extension-host tests once command and chat flows stabilize.

## Current Coverage
- `MemorySearch` verifies related file patterns rank above plain text matches.
