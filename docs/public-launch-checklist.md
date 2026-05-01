# Public Launch Checklist

This repository is not public yet. Complete this checklist before changing visibility.

## Current Status

- License: MIT
- Status: experimental, pre-1.0
- Local secret scan: no matches in current tracked files
- Git history secret scan: no matches across current commits
- Dependency audit: `pnpm audit --audit-level moderate` reports no known vulnerabilities after dependency overrides
- Package freshness: `pnpm outdated` returned no outdated direct dependencies
- npm package name: `dixie-flatline` returned 404 from npm registry during lookup, so it does not appear to be published there
- GitHub secret scanning/push protection: attempted via GitHub API, but GitHub returned `Secret scanning is not available for this repository`
- Generated artifacts: `dist/`, `.nx/`, `coverage/`, and `*.vsix` are ignored
- Private memory: current `.llm-wiki/` entries are project memory for Dixie Flatline itself and are intended to be public

## Before Visibility Change

- Confirm `.llm-wiki/` contains no private prompts, private repo memory, customer names, internal roadmap details, Slack excerpts, screenshots, or proprietary snippets.
- Confirm ignored local artifacts are not uploaded elsewhere as release assets by accident.
- Enable GitHub secret scanning and push protection where available.
- Enable private vulnerability reporting if available.
- Add branch protection for `main` after CI has run at least once.
- Confirm package and extension publishing names before publishing to npm or the VS Code Marketplace.
- `npm audit` and `npm outdated` could not be run in the local Codex environment because `npm` is not installed with the bundled Node runtime; use pnpm results and/or run npm checks in another local Node installation if needed.

## Branding Risk

The name "Dixie Flatline" is pop-culture-adjacent and appears in public search results outside this project, including Neuromancer-related references and an established Vocaloid producer name. Treat public use of the name as a deliberate branding decision before launch.

## Launch Copy

One-sentence pitch:

> Dixie Flatline is an experimental VS Code extension for structured, repo-local AI memory that helps Copilot respect project decisions.

Repository description:

> Experimental VS Code extension for structured, time-aware, repo-local AI memory.
