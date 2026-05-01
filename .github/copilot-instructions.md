# Project Instructions for Copilot

## Project Overview

- This is an Nx workspace for a VS Code extension named Dixie Flatline.
- Tagline: Persistent project memory for AI coding agents.
- The extension stores typed, time-aware, decision-aware memory in `.llm-wiki/memory/` Markdown files with schema frontmatter.
- The extension app lives in `apps/project-memory-extension`.

## Key Decisions and Constraints

- Dixie Flatline is an intelligence layer, not a passive wiki.
- Markdown is the source of truth, but every memory entry must be typed and include importance, confidence, timestamps, sources, and supersession metadata.
- Keep Phase 1 dependency-light and deterministic; do not add vector DB or hosted RAG infrastructure.
- Keep VS Code API imports at the extension edge so core memory modules remain unit-testable.
- Tool contribution names in `apps/project-memory-extension/package.json` must match registrations in `src/tools/toolProvider.ts`.
- Default retrieval and instruction compilation should prioritize critical/high importance, high confidence, and fresh verification.

## Conventions

- Use strict TypeScript.
- Prefer small service classes with explicit responsibilities.
- Keep memory parsing, scoring, and instruction generation free of VS Code runtime dependencies.
- Use repository-relative paths with forward slashes in memory frontmatter `relatedFiles`.
- Decision entries should include constraints and anti-patterns so Copilot can change behavior.

## Testing

- Use Vitest for deterministic core behavior.
- Add extension-host tests before depending on UI/chat behavior for release confidence.

_Generated from `.llm-wiki/memory/` by Dixie Flatline._
