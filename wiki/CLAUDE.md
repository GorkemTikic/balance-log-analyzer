# Balance Log Analyzer Wiki Schema

This folder is the single Obsidian vault and llm-wiki for the Balance Log
Analyzer project. It follows the persistent wiki pattern from
[selmakcby/knowledge-pipeline](https://github.com/selmakcby/knowledge-pipeline):
raw sources stay immutable, the markdown wiki is the maintained knowledge
graph, and this file is the schema that disciplines every LLM or human
contributor.

## Purpose

Maintain an accumulated, source-backed knowledge base for a browser-only
Binance USDⓈ-M Futures Balance Log analyzer. The wiki should help future
agents understand parser behavior, reconciliation math, UI decisions,
known defects, and product requirements without rediscovering them from
scratch each session.

## Three-layer model

1. `raw/` is immutable source material. It may contain copied specs,
   screenshots, exported logs, or other primary evidence. Agents may read
   it but must not edit it after setup.
2. The wiki graph is the maintained markdown layer. Agents create and
   update pages in `sources/`, `entities/`, `concepts/`, `decisions/`,
   `issues/`, and `syntheses/`.
3. `CLAUDE.md` is the schema. If the workflow stops matching reality,
   update this schema first, then align affected pages.

## Role split

- The user supplies goals, project judgment, source material, and review
  feedback.
- The agent reads sources, files findings, keeps cross-references healthy,
  flags contradictions, updates `index.md`, and logs every meaningful
  wiki operation.

## Hard rules

- `raw/` is immutable after setup. Do not edit, delete, rewrite, or
  "clean up" raw sources. If a source is superseded, add or reference a
  newer source and mark the contradiction in the wiki.
- Every meaningful claim needs a source: a repo path, a raw source file,
  an external URL, or another wiki page that itself has sources.
- Never delete pages. Move stale pages to `archive/`, set
  `status: archived`, and explain why in front matter or a short note.
- Contradictions are not erased. Add a `## Contradictions` section and
  cite both sides until resolved.
- Keep filenames kebab-case.
- Keep all wiki prose in English. Product names and technical terms may
  stay as written in code.
- Keep exactly one vault root: `wiki/`. Do not create nested `wiki/wiki`,
  `vault/`, or duplicate Obsidian vault folders.
- Update `index.md` whenever a page is created, moved, archived, or
  materially changed.
- Update `log.md` for every ingest, filed-back query, lint pass, or
  meaningful wiki maintenance operation.

## Folder taxonomy

- `raw/docs/` - immutable primary documents, screenshots, copied specs,
  or exported balance-log samples.
- `raw/assets/` - immutable image/PDF attachments used by Obsidian.
- `sources/codebase/` - source notes extracted from this repository.
- `sources/external/` - source notes for external references such as
  the knowledge-pipeline repo.
- `entities/` - concrete objects: files, modules, components, assets,
  APIs, account types, or external systems.
- `concepts/` - abstract ideas and reusable domain terms.
- `decisions/` - atomic architectural/product decisions, one decision
  per page.
- `issues/` - known bugs, risks, debts, or open product problems.
- `syntheses/` - high-level summaries that pull multiple pages together.
- `archive/` - superseded pages. Nothing is deleted.

## Page format

Each wiki page should start with YAML front matter:

```yaml
---
title: Page title
type: source | synthesis | decision | issue | concept | entity | lint
status: active | archived
date: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - balance-log
source:
  - path/or/url
related:
  - "[[project-overview]]"
---
```

Then use this body shape unless a page has a strong reason to differ:

1. `# Page title`
2. `## Summary`
3. Body sections specific to the page.
4. `## Sources`
5. `## Related`

Use Obsidian double-bracket links for wiki relationships. Use Markdown
links for repo paths and external URLs.

## INGEST workflow

Use this when new source material, code review output, screenshots, or
session summaries need to enter the vault.

1. Read `index.md` and this schema first.
2. Read the new source. If it is external, create or update a page under
   `sources/external/`. If it is codebase material, use
   `sources/codebase/`.
3. Extract key facts, entities, concepts, decisions, issues, and open
   questions.
4. Create or update atomic pages:
   - entity pages for files/modules/assets/account types
   - concept pages for parser/reconciliation/design ideas
   - decision pages for product or architecture choices
   - issue pages for bugs, risks, and unresolved problems
5. Cross-link both directions where useful.
6. Mark contradictions in the relevant page instead of smoothing them
   away.
7. Update `index.md` with one-line summaries and status.
8. Add a `## [YYYY-MM-DD] ingest | ...` entry to `log.md`.

## QUERY workflow

Use this when answering a question from the wiki.

1. Read `index.md`.
2. Open the most relevant pages, then follow their `Related` links only
   as needed.
3. Answer with source references.
4. If the answer is a reusable synthesis, decision, comparison, or lesson,
   file it back as an atomic wiki page and update `index.md` and `log.md`.

## LINT workflow

Run periodically or after major project changes.

Check for:

- pages not listed in `index.md`
- index entries pointing to missing files
- missing `Sources` or weakly sourced claims
- orphan pages with no meaningful incoming/outgoing links
- stale claims contradicted by newer code or tests
- duplicate vault roots or nested wiki folders
- missing `.gitkeep` files in empty taxonomy folders
- pages that should be archived instead of left active

Write or update `lint-report.md` with findings. Do not automatically
rewrite major content during a lint pass unless the user asked for fixes.

## Log format

Prefer heading entries so the log can be parsed by simple tools:

```md
## [2026-05-03] ingest | Knowledge-pipeline alignment

- Created: ...
- Updated: ...
- Sources: ...
```

Legacy bullet entries may remain below newer heading entries.

## Project-specific guardrails

- Scope remains Binance USDⓈ-M Futures. Coin-M activity is excluded from
  wallet reconciliation with a visible reason.
- Dynamic balance-log types are expected. Do not introduce a closed enum
  that can silently drop unknown types.
- Reconciliation math is `expected = baseline + transfer-at-start +
  included activity in range`.
- UI notes should distinguish user-facing copy from agent-only diagnostic
  context.
- Parser, diagnostics, Story, Swaps & Events, and Event Contracts changes
  should be documented as issues, decisions, or source notes when they
  affect product behavior.

## Sources

- [knowledge-pipeline README](https://github.com/selmakcby/knowledge-pipeline)
- [knowledge-pipeline SKILL.md](https://raw.githubusercontent.com/selmakcby/knowledge-pipeline/main/SKILL.md)
- [knowledge-pipeline PROMPTS.md](https://raw.githubusercontent.com/selmakcby/knowledge-pipeline/main/PROMPTS.md)
- `src/lib/balanceLog.ts`
- `src/components/StoryDrawer.tsx`
