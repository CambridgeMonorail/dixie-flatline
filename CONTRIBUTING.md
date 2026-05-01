# Contributing

Thanks for helping improve Dixie Flatline.

## Status

Dixie Flatline is experimental. APIs, memory schema, command names, and tool names may change before a stable release.

## Local Setup

```bash
pnpm install
pnpm lint
pnpm test
pnpm build
```

## Pull Requests

- Create a feature branch before making reviewable changes. Do not develop fixes or features directly on `main`.
- Keep changes focused.
- Run the narrowest relevant local validation before opening or updating a pull request, and include that validation in the PR description.
- Add or update tests for behavior changes.
- Update `.llm-wiki/memory/` when decisions, constraints, known issues, or open questions change.
- Do not commit generated files such as `dist/`, `.nx/`, `coverage/`, or `*.vsix`.
- Do not commit real `.env` files, credentials, private repo memory, screenshots from private systems, or copied private docs.

## Public Memory Rule

The `.llm-wiki/` files in this repo are intentionally public project memory for Dixie Flatline itself. Do not add private customer names, private roadmap material, proprietary snippets, Slack excerpts, or internal company references.
