---
title: Wiki lint report
type: lint
status: active
date: 2026-05-03
updated: 2026-05-03
tags:
  - wiki
  - lint
source:
  - CLAUDE.md
  - index.md
related:
  - "[[wiki-follows-knowledge-pipeline]]"
---

# Wiki lint report

## Summary

Initial knowledge-pipeline alignment lint for the local `wiki/` vault.

## Checks

| Check | Result |
| --- | --- |
| Single vault root | Pass: only `wiki/` is used as the vault root. |
| Duplicate nested vault folders | Pass: no `wiki/wiki/` or `vault/` duplicate was found. |
| Required control files | Pass: `CLAUDE.md`, `index.md`, and `log.md` exist. |
| Core taxonomy folders | Pass: `raw/`, `sources/`, `entities/`, `concepts/`, `decisions/`, `issues/`, `syntheses/`, and `archive/` exist. |
| Empty-folder placeholders | Pass: `.gitkeep` placeholders exist for the current empty taxonomy folders. |
| External methodology source note | Pass: `sources/external/2026-05-03-knowledge-pipeline.md` records the reference repo. |
| Wiki links | Pass: all double-bracket links resolve to local markdown basenames. |

## Follow-ups

- Existing 2026-05-02 log entries remain in legacy bullet format below the
  new heading-style entries. This is acceptable history, but new entries
  should use `## [YYYY-MM-DD] operation | title`.
- Existing pages should continue gaining richer `tags`, `source`, and
  `related` front matter as they are touched.

## Sources

- `wiki/CLAUDE.md`
- `wiki/index.md`
- [[2026-05-03-knowledge-pipeline|knowledge-pipeline reference]]

## Related

- [[wiki-follows-knowledge-pipeline]]
