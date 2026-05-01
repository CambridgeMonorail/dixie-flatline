---
id: branch-first-validation-workflow
type: decision
title: Work on branches and validate before opening pull requests
summary: Changes should be developed on feature branches and validated locally before they are proposed for review.
createdAt: 2026-05-01
lastUpdatedAt: 2026-05-01
lastVerifiedAt: 2026-05-01
confidence: high
importance: high
relatedFiles:
  - .github/copilot-instructions.md
  - CONTRIBUTING.md
  - .github/workflows/ci.yml
tags:
  - git
  - workflow
  - quality
sources:
  - CONTRIBUTING.md
supersedes:
supersededBy:
---

## Work on branches and validate before opening pull requests

## Summary

Changes should be developed on feature branches and validated locally before they are proposed for review.

## Context

The repository uses pull requests and CI as the review path for changes to `main`. Working directly on `main` increases the chance of mixing incomplete work into the default branch and makes review discipline weaker.

## Decision

Create or switch to a non-`main` branch before making code or documentation changes intended for review. Before opening or updating a pull request, run the narrowest relevant local validation for the changed surface and confirm it passes.

## Consequences

Reviewable changes stay isolated from `main`. Pull requests carry a clearer validation story. Contributors and coding agents are expected to treat local validation as part of finishing the task, not as optional follow-up.

## Constraints

- Do not develop reviewable changes directly on `main`.
- Use focused validation first, then broader checks when needed.
- Include the validation performed when raising a pull request.

## Anti-Patterns

- Do not make feature or fix changes on `main` and sort out branching later.
- Do not open a pull request without running relevant local checks.
- Do not rely on CI as the first signal that the change is broken.
