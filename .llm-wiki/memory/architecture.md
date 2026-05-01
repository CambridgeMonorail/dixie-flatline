---
id: dixie-flatline-architecture
type: fact
title: Dixie Flatline extension architecture
summary: Dixie Flatline is an Nx-managed VS Code extension that stores structured, behavior-guiding memory in repo-local Markdown.
createdAt: 2026-05-01
lastUpdatedAt: 2026-05-01
lastVerifiedAt: 2026-05-01
confidence: high
importance: high
relatedFiles:
  - apps/project-memory-extension/src/**
tags:
  - vscode
  - copilot
  - nx
sources:
  - README.md
supersedes:
supersededBy:
---

# Dixie Flatline extension architecture

## Summary
Dixie Flatline is an Nx-managed VS Code extension that stores structured, behavior-guiding memory in repo-local Markdown.

## Claims
- The extension app lives in `apps/project-memory-extension`.
- `extension.ts` wires activation, commands, chat participant, and language-model tools.
- `memory/` owns Markdown loading, schema normalization, indexing, and deterministic retrieval ranking.
- `chat/` owns the `@project-memory` participant.
- `tools/` exposes Copilot language-model tools backed by the memory services.
- `instructions/` compiles high-importance memory into `.github/copilot-instructions.md`.
- `diff/` provides MVP heuristic classification for future memory updates.
