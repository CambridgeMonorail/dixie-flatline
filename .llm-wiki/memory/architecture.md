---
id: project-memory-extension-architecture
type: architecture
status: living
confidence: high
last_reviewed: 2026-05-01
related_files:
  - apps/project-memory-extension/src/**
tags:
  - vscode
  - copilot
  - nx
---

# Project Memory Extension Architecture

## Summary
This repository is an Nx workspace containing a VS Code extension app at `apps/project-memory-extension`.

## Components
- `extension.ts` wires activation, commands, chat participant, and language-model tools.
- `memory/` owns Markdown loading, frontmatter parsing, indexing, and deterministic search.
- `chat/` owns the `@project-memory` participant.
- `tools/` exposes Copilot language-model tools backed by the memory services.
- `instructions/` builds `.github/copilot-instructions.md` from memory pages.
- `diff/` provides MVP heuristic classification for future memory updates.
