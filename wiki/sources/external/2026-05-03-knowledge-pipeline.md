---
title: Knowledge-pipeline reference
type: source
status: active
date: 2026-05-03
updated: 2026-05-03
tags:
  - wiki
  - knowledge-pipeline
source:
  - https://github.com/selmakcby/knowledge-pipeline
  - https://raw.githubusercontent.com/selmakcby/knowledge-pipeline/main/SKILL.md
  - https://raw.githubusercontent.com/selmakcby/knowledge-pipeline/main/PROMPTS.md
related:
  - "[[llm-wiki]]"
  - "[[wiki-follows-knowledge-pipeline]]"
---

# Knowledge-pipeline reference

## Summary

The knowledge-pipeline repo describes a persistent LLM-maintained wiki
pattern: keep primary material immutable in `raw/`, let the agent maintain
the markdown knowledge graph, and use a schema file such as `CLAUDE.md`
to enforce naming, page format, ingest/query/lint workflows, and hard
rules.

## Key points for this project

- The wiki should be cumulative, not a one-off response cache. Good
  answers and important review findings should be filed back as atomic
  pages.
- `raw/` is the source-of-truth layer and must stay immutable.
- `index.md` is the content catalog agents read first.
- `log.md` is append-only and should record ingests, filed-back queries,
  and lint passes with dated entries.
- `CLAUDE.md` is the vault constitution: folder taxonomy, page format,
  naming, hard rules, and project-specific workflows live there.
- The three recurring operations are INGEST, QUERY, and LINT.
- Lint checks should look for contradictions, stale claims, orphan pages,
  missing cross-links, and missing source coverage.

## Mapping to Balance Log Analyzer

- `sources/codebase/` should hold notes extracted from local files and
  review sessions.
- `sources/external/` holds method references like this page.
- `issues/` should track parser risks, UI/math inconsistencies, and
  product debt.
- `decisions/` should capture durable product choices such as USDⓈ-M-only
  scope and the choice to use the knowledge-pipeline pattern.
- `syntheses/` should summarize the current system model for future agents.

## Sources

- [Knowledge Pipeline README](https://github.com/selmakcby/knowledge-pipeline)
- [LLM Wiki skill](https://raw.githubusercontent.com/selmakcby/knowledge-pipeline/main/SKILL.md)
- [Ready-to-use prompts](https://raw.githubusercontent.com/selmakcby/knowledge-pipeline/main/PROMPTS.md)

## Related

- [[llm-wiki]]
- [[wiki-follows-knowledge-pipeline]]
