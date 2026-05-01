---
id: extension-boundary-conventions
type: decision
title: Keep VS Code APIs at the extension boundary
summary: Core memory logic should remain deterministic and testable outside the VS Code extension host.
createdAt: 2026-05-01
lastUpdatedAt: 2026-05-01
lastVerifiedAt: 2026-05-01
confidence: high
importance: high
relatedFiles:
  - apps/project-memory-extension/src/**
tags:
  - typescript
  - testing
  - vscode
sources:
  - apps/project-memory-extension/src/memory/memorySearch.spec.ts
supersedes:
supersededBy:
---

# Keep VS Code APIs at the extension boundary

## Summary
Core memory logic should remain deterministic and testable outside the VS Code extension host.

## Context
Memory parsing, scoring, instruction compilation, and diff analysis should be unit-testable in Vitest without loading VS Code.

## Decision
Keep `vscode` imports in command, chat, tool, and workspace boundary modules. Core memory modules should depend on Node and local types only.

## Consequences
Unit tests can validate ranking and parsing quickly. Extension-host tests can be added later for activation, command, and chat behavior.

## Constraints
- Do not import `vscode` from `memory/`, `diff/`, or `instructions/`.
- Keep deterministic ranking logic in pure TypeScript modules.
- Use repository-relative paths with forward slashes in memory frontmatter.

## Anti-Patterns
- Do not couple core schema parsing to active editor state.
- Do not make Copilot tool implementations own ranking logic directly.
