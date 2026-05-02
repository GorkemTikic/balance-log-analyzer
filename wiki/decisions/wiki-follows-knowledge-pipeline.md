---
title: Wiki follows knowledge-pipeline
type: decision
status: active
date: 2026-05-03
updated: 2026-05-03
tags:
  - wiki
  - decision
source:
  - sources/external/2026-05-03-knowledge-pipeline.md
related:
  - "[[llm-wiki]]"
---

# Wiki follows knowledge-pipeline

## Summary

The project wiki adopts the knowledge-pipeline pattern as its operating
model. The vault remains a single `wiki/` folder, with `raw/` as immutable
source material, markdown pages as the maintained graph, and `CLAUDE.md`
as the schema for future agents.

## Rationale

Balance Log Analyzer has fast-changing product requirements: Binance adds
new balance-log types, parser edge cases arrive from real pasted pages,
and the UI needs to stay agent-friendly. A persistent wiki prevents each
agent from rediscovering parser history, reconciliation rules, and user
preferences from scratch.

## Consequences

- Future project reviews should be filed as source notes or issues when
  they contain reusable knowledge.
- Durable product choices belong in `decisions/`.
- Known defects and design debts belong in `issues/`.
- Synthesis pages should summarize the current state after meaningful
  code changes.
- `index.md` and `log.md` are active maintenance files, not static docs.

## Sources

- [[2026-05-03-knowledge-pipeline|knowledge-pipeline reference]]
- [[llm-wiki]]
- [knowledge-pipeline README](https://github.com/selmakcby/knowledge-pipeline)

## Related

- [[llm-wiki]]
- [[project-overview]]
