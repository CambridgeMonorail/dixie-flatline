---
applyTo: "**"
---

Use `.llm-wiki/memory/` as the durable project memory source. Memory entries must be typed as `decision`, `fact`, `assumption`, `known_issue`, or `question`, and should include importance, confidence, freshness, sources, and supersession metadata. Prefer updating memory when architecture, conventions, decisions, domain concepts, testing strategy, known issues, conflicts, or open questions change.
