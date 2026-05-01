---
id: structured-memory-not-wiki
type: decision
title: Build a structured intelligence layer, not a wiki
summary: Dixie Flatline stores typed, time-aware, decision-aware memory that actively influences Copilot behavior.
createdAt: 2026-05-01
lastUpdatedAt: 2026-05-01
lastVerifiedAt: 2026-05-01
confidence: high
importance: critical
relatedFiles:
  - apps/project-memory-extension/src/memory/**
  - apps/project-memory-extension/src/instructions/**
  - apps/project-memory-extension/src/tools/**
tags:
  - memory-model
  - copilot
  - intelligence-layer
sources:
  - Spec Update - From Wiki to Intelligence Layer
supersedes:
  - project-memory-extension-architecture
supersededBy:
---

# Build a structured intelligence layer, not a wiki

## Summary
Dixie Flatline stores typed, time-aware, decision-aware memory that actively influences Copilot behavior.

## Context
The original MVP treated memory as Markdown wiki pages with basic search. That approach does not scale well, can persist stale or conflicting knowledge, and does not reliably influence Copilot behavior.

## Decision
Represent memory as structured entries with required type, confidence, importance, timestamps, source references, and supersession metadata. Retrieval and instruction generation must prioritize critical/high importance entries, high confidence, freshness, and file relevance.

## Consequences
Copilot receives behavior-guiding constraints rather than passive documentation. Outdated knowledge is deprioritized. Conflicts remain visible instead of being flattened away.

## Constraints
- Every entry must have a type from `decision`, `fact`, `assumption`, `known_issue`, or `question`.
- Default retrieval should exclude low-importance entries.
- Entries with no `lastVerifiedAt` must be treated as stale or lower confidence.
- Instruction compilation should include only critical/high importance entries.
- Conflicts and superseded decisions must remain retrievable.

## Anti-Patterns
- Do not treat `.llm-wiki` as unstructured notes.
- Do not flatten competing decisions into a single undocumented answer.
- Do not include low-importance memory in default Copilot instructions.
