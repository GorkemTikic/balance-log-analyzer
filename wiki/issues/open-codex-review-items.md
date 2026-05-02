---
title: Open Codex review items (P6, P9–P12)
type: issue
status: active
date: 2026-05-03
updated: 2026-05-03
tags:
  - balance-log
  - code-review
  - tech-debt
  - ci
source:
  - CODEX_REVIEW_REPORT.md
related:
  - "[[hidden-filters-silent-row-loss]]"
  - "[[typefilter-toggle-semantics]]"
---

# Open Codex review items (P6, P9–P12)

## Summary

Five items from the Codex code review report remain unresolved as of
2026-05-03. Items P1–P5, P7, and P8 were fixed in the same session.

## Open items

### P6 — Exchange event grouping collides on same-second swaps

**File:** `src/` (swap/event grouping logic)

The event grouping key is timestamp-only. Two different swaps that occur
within the same second share a key and are incorrectly merged into one
event. There is no transaction ID available in the Binance USDⓈ-M Futures
balance log format, so a reliable deduplication key cannot be constructed
without additional data.

**Blocker:** No txid in the log format. Resolution requires either a Binance
API call to fetch the txid, a user-supplied correlation field, or acceptance
of the ambiguity with a visible warning.

---

### P9 — CI uses `npm install` instead of `npm ci`; no lint/test gates

**File:** `.github/workflows/` (CI workflow)

The CI workflow runs `npm install`, which does not enforce lockfile
integrity and may silently upgrade patch-level dependencies. There are no
lint or test steps in the workflow, so regressions can merge undetected.

**Fix needed:** Replace `npm install` with `npm ci`. Add `npm run lint` and
`npm run test` (or `vitest run`) steps with appropriate failure conditions.

---

### P10 — 9 npm audit advisories (5 high, 4 moderate) unaddressed

**File:** `package.json`, `package-lock.json`

`npm audit` reports 9 advisories at the time of the review: 5 high, 4
moderate. None were triaged or resolved in the P1–P8 session.

**Fix needed:** Run `npm audit fix` for auto-fixable advisories. Review
remaining advisories manually; accept with justification or upgrade
dependencies as appropriate. Document accepted risks in this page.

---

### P11 — ~31 files need Prettier formatting

**File:** Project-wide

Prettier was not run after the P1–P8 session. Approximately 31 files have
formatting drift from the project's Prettier config.

**Fix needed:** Run `npx prettier --write .` (or the equivalent npm script)
and commit the result as a formatting-only commit.

---

### P12 — Operational UI redesign deferred

**Scope:** Multiple UI components

A glass/glow visual design pass, replacement of `alert()` calls with
in-component error UI, and responsive table handling were listed in the
Codex review but not actioned. These are lower-priority UX improvements
with no correctness impact.

**Fix needed:** Design pass; scope and effort to be defined before starting.

## Sources

- `CODEX_REVIEW_REPORT.md` (P6, P9, P10, P11, P12)

## Related

- [[hidden-filters-silent-row-loss]] — resolved P1
- [[typefilter-toggle-semantics]] — resolved P2
