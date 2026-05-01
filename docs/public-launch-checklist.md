# Public Launch Checklist

This repository is already public. Keep this checklist as a record of the public-readiness pass and as an ongoing checklist for release maintenance on this repository and future public repos.

## Current Status

- License: MIT
- Status: experimental, pre-1.0
- Local secret scan: no matches in current tracked files
- Git history secret scan: no matches across current commits
- Dependency audit: `pnpm audit --audit-level moderate` reports no known vulnerabilities after dependency overrides
- Package freshness: `pnpm outdated` returned no outdated direct dependencies
- npm package name: `dixie-flatline` returned 404 from npm registry during lookup, so it does not appear to be published there
- GitHub secret scanning/push protection: enabled after the repository became public
- Branch protection: enabled after the repository became public; `main` requires `Build and test` and one approving review
- Branding assets: logo, icon, README header, and social preview generated under `docs/brand/`
- GitHub repo description and topics have been set. Upload `docs/brand/og-image.png` manually as the GitHub social preview before launch.
- First release: `v0.1.0` created with `dixie-flatline-0.1.0.vsix`
- Generated artifacts: `dist/`, `.nx/`, `coverage/`, and `*.vsix` are ignored
- Private memory: current `.llm-wiki/` entries are project memory for Dixie Flatline itself and are intended to be public

## Ongoing Protections And Launch Checks

- Confirm `.llm-wiki/` contains no private prompts, private repo memory, customer names, internal roadmap details, Slack excerpts, screenshots, or proprietary snippets.
- Confirm ignored local artifacts are not uploaded elsewhere as release assets by accident.
- Keep GitHub secret scanning and push protection enabled.
- Enable private vulnerability reporting if available.
- Keep branch protection for `main` enabled, requiring the `Build and test` CI check and at least one approving review.
- Confirm package and extension publishing names before publishing to npm or the VS Code Marketplace.
- `npm audit` and `npm outdated` could not be run in the local Codex environment because `npm` is not installed with the bundled Node runtime; use pnpm results and/or run npm checks in another local Node installation if needed.

## Branding Risk

The name "Dixie Flatline" is pop-culture-adjacent and appears in public search results outside this project, including Neuromancer-related references and an established Vocaloid producer name. Treat public use of the name as a deliberate branding decision before launch.

## Launch Copy

One-sentence pitch:

> Dixie Flatline is an experimental VS Code extension for structured, repo-local AI memory that helps Copilot respect project decisions.

Repository description:

> Experimental VS Code extension for structured, time-aware, repo-local AI memory.
