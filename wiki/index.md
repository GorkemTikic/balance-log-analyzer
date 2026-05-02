# Balance Log Analyzer Wiki

Project knowledge vault for the Binance USDⓈ-M Futures Balance Log
analyzer. Start with [CLAUDE.md](CLAUDE.md) for the schema and operating
rules. This vault follows the knowledge-pipeline pattern: immutable
sources, maintained markdown graph, and append-only operational log.

## Control files

- [CLAUDE.md](CLAUDE.md) - schema, hard rules, folder taxonomy, and
  INGEST / QUERY / LINT workflows.
- [log.md](log.md) - append-only dated event log.
- [lint-report.md](lint-report.md) - latest wiki health check.

## Sources

- [Knowledge-pipeline reference](sources/external/2026-05-03-knowledge-pipeline.md) -
  external methodology source used to align this vault.

## Syntheses

- [Project overview](syntheses/project-overview.md) - current system map:
  parser, reconciliation, UI shell, Story drawer, and diagnostics.
- [USDⓈ-M reconciliation model](syntheses/usds-m-reconciliation-model.md) -
  formula, inputs, outputs, and decimal-safe arithmetic rationale.

## Decisions

- [USDⓈ-M-only scope](decisions/usds-m-only-scope.md) - Coin-M rows are
  quarantined outside wallet reconciliation.
- [Wiki follows knowledge-pipeline](decisions/wiki-follows-knowledge-pipeline.md) -
  the vault adopts the persistent LLM wiki operating model.
- [Visible row filters](decisions/visible-row-filters.md) - localStorage
  filter persistence removed; filters are plain visible state-backed inputs.
- [Hidden types model](decisions/hidden-types-model.md) - TypeFilter switched
  from "selected shown" to "hidden types"; Show All / Hide All buttons.
- [Decimal-safe narrative accumulation](decisions/decimal-safe-narrative-accumulation.md) -
  StoryNarrative final balance uses `decimal.add()` (BigInt-backed) instead
  of JS `+=`.

## Concepts

- [LLM wiki](concepts/llm-wiki.md) - persistent agent-maintained markdown
  graph used as project memory.

## Issues

- [Dynamic balance-log types](issues/dynamic-balance-log-types.md) - new
  Binance row types must not break parsing or disappear from the audit.
- [Parser fixed-column risk](issues/parser-fixed-column-risk.md) -
  historical fixed-column parser risk and remaining heuristic concerns.
- [Hidden filters silent row loss](issues/hidden-filters-silent-row-loss.md) -
  **archived** — stale localStorage filter values silently dropped rows; fixed
  in P1 session.
- [TypeFilter toggle semantics](issues/typefilter-toggle-semantics.md) -
  **archived** — TypeFilter toggle was inverted; fixed in P2 session.
- [Open Codex review items](issues/open-codex-review-items.md) - **active** —
  P6 (same-second event collision), P9 (CI gaps), P10 (npm audit), P11
  (Prettier drift), P12 (UI redesign) remain unresolved.

## Folder map

- `raw/docs/` - immutable primary documents, screenshots, copied specs,
  or exported samples.
- `raw/assets/` - immutable attachments for Obsidian.
- `sources/codebase/` - source notes anchored to local repo files.
- `sources/external/` - external methodology or reference notes.
- `entities/` - concrete subjects: files, modules, assets, systems.
- `concepts/` - abstract ideas and reusable terms.
- `decisions/` - one durable product or architecture decision per page.
- `issues/` - bugs, risks, debts, and unresolved questions.
- `syntheses/` - high-level summaries.
- `archive/` - superseded pages; never delete.
