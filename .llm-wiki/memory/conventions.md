---
id: project-memory-conventions
type: convention
status: living
confidence: high
last_reviewed: 2026-05-01
related_files:
  - apps/project-memory-extension/src/**
tags:
  - typescript
  - testing
---

# Conventions

## Summary
- Keep the MVP dependency-light; prefer Node and VS Code APIs before adding runtime packages.
- Use strict TypeScript and small service classes.
- Keep deterministic behavior in core modules so tests do not need the VS Code runtime.
- Tool names use the `project-memory_*` prefix and must match `contributes.languageModelTools`.
