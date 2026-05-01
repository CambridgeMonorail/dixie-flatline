# Spec Update: From Wiki to Intelligence Layer

This updates the original MVP spec. Dixie Flatline is no longer just a Markdown wiki with search.

The new target is:

```txt
A structured, time-aware, decision-aware memory layer that actively influences Copilot behaviour
```

## Why

Basic LLM wiki approaches fail when content grows, knowledge becomes stale, hallucinated notes are persisted, conflicts are hidden, and stored memory has no practical effect on Copilot behavior.

## Memory Types

```ts
type MemoryType =
  | "decision"
  | "fact"
  | "assumption"
  | "known_issue"
  | "question"
```

Every entry includes identity, summary, related files, tags, timestamps, confidence, importance, sources, and supersession metadata.

Decision entries also include context, decision, consequences, constraints, and anti-patterns. Fact entries may hold competing claims. Question entries track explicit unknowns.

## Ranking

Retrieval ranks by:

- file relevance
- importance
- confidence
- freshness

Entries without `lastVerifiedAt` are treated as stale or lower confidence. Low-importance entries are excluded from default retrieval and instruction compilation.

## Conflict Handling

Conflicts are stored rather than resolved automatically. Supersession metadata and conflicting language are retrievable so Copilot can see ambiguity where it exists.

## Instruction Compilation

`.github/copilot-instructions.md` is generated from critical/high-importance memory, prioritising high confidence and recently verified decisions.

The output should stay around 1-2k tokens and focus on behavioral constraints, anti-patterns, conventions, and key decisions.

## Updated Tool Surface

```ts
getRelevantMemory(filePath: string)
getCriticalDecisions()
recordDecision(input)
updateMemoryFromDiff(diff)
findConflicts(topic: string)
getOpenQuestions()
generateCopilotInstructions()
```

## Non-Goals

- No heavy external vector database
- No complex UI in the MVP
- No full graph visualisation in the MVP
