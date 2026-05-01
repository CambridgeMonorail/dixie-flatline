---
id: mvp-known-issues
type: known_issue
title: MVP known issues
summary: The MVP has deterministic foundations but still lacks full diff synthesis and extension-host coverage.
createdAt: 2026-05-01
lastUpdatedAt: 2026-05-01
lastVerifiedAt: 2026-05-01
confidence: medium
importance: high
relatedFiles:
  - apps/project-memory-extension/src/**
tags:
  - mvp
  - known-issue
sources:
  - README.md
supersedes:
  - project-memory-known-issues
supersededBy:
---

# MVP known issues

## Summary
The MVP has deterministic foundations but still lacks full diff synthesis and extension-host coverage.

## Claims
- Diff processing is heuristic-only and suggests memory updates rather than synthesizing final entries.
- Extension-host integration tests are not yet wired.
- Conflict detection is metadata and keyword based, not semantic.
- Marketplace publishing metadata can be expanded later.
- The name "Dixie Flatline" has public non-software associations and should be treated as a deliberate branding decision before launch.
- GitHub secret scanning and push protection must remain enabled because the repository became public before those protections were in place.
- GitHub branch protection must remain enabled because the repository became public before that protection was in place.
