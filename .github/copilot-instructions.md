# Project Instructions for Copilot

## Project Overview

- This is an Nx workspace for a VS Code extension named Dixie Flatline.
- The extension stores repo-local memory in `.llm-wiki/memory/` Markdown files with frontmatter.
- The extension app lives in `apps/project-memory-extension`.

## Key Decisions and Constraints

- Markdown is the source of truth for durable memory.
- Keep Phase 1 dependency-light and deterministic; do not add vector DB or hosted RAG infrastructure.
- Keep VS Code API imports at the extension edge so core memory modules remain unit-testable.
- Tool contribution names in `apps/project-memory-extension/package.json` must match registrations in `src/tools/toolProvider.ts`.

## Conventions

- Use strict TypeScript.
- Prefer small service classes with explicit responsibilities.
- Keep memory parsing, scoring, and instruction generation free of VS Code runtime dependencies.
- Use repository-relative paths with forward slashes in memory frontmatter.

## Testing

- Use Vitest for deterministic core behavior.
- Add extension-host tests before depending on UI/chat behavior for release confidence.

_Generated from `.llm-wiki/memory/` by Dixie Flatline._
