---
title: LLM wiki
type: concept
status: active
date: 2026-05-03
updated: 2026-05-03
tags:
  - wiki
  - knowledge-management
source:
  - sources/external/2026-05-03-knowledge-pipeline.md
related:
  - "[[2026-05-03-knowledge-pipeline|knowledge-pipeline reference]]"
  - "[[wiki-follows-knowledge-pipeline]]"
---

# LLM wiki

## Summary

An LLM wiki is a persistent markdown knowledge graph maintained by an
agent over time. Instead of rediscovering facts from raw material on every
question, the agent reads sources once, files durable notes, cross-links
entities and concepts, tracks contradictions, and keeps the index current.

## Project meaning

For Balance Log Analyzer, the LLM wiki is the memory layer for product
requirements and implementation facts. It should preserve:

- parser and reconciliation invariants
- UI requirements from user feedback
- known bugs and test gaps
- architecture decisions and their rationale
- source-backed summaries of important code reviews

## Operational loop

1. INGEST new source material into source, entity, concept, decision,
   issue, and synthesis pages.
2. QUERY the wiki before answering project questions.
3. LINT the wiki for stale claims, missing links, and contradictions.

## Sources

- [[2026-05-03-knowledge-pipeline|knowledge-pipeline reference]]
- [knowledge-pipeline SKILL.md](https://raw.githubusercontent.com/selmakcby/knowledge-pipeline/main/SKILL.md)

## Related

- [[wiki-follows-knowledge-pipeline]]
