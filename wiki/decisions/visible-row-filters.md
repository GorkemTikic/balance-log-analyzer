---
title: Visible state-backed row filters replace localStorage persistence
type: decision
status: active
date: 2026-05-03
updated: 2026-05-03
tags:
  - balance-log
  - filters
  - localStorage
  - ux
source:
  - src/App.tsx
related:
  - "[[hidden-filters-silent-row-loss]]"
---

# Visible state-backed row filters replace localStorage persistence

## Summary

Row filters (`t0`, `t1`, `symbol`) are now held in plain React `useState`
hooks and rendered as visible inputs in the UI. The prior localStorage key
`bl.filters.v4` is removed on mount. Filter state is never persisted across
sessions.

## Context

The previous implementation stored filter values in localStorage under the
key `bl.filters.v4`. The getter was consumed but the setter was dropped,
making the filters write-once (only from a prior session's stale data) and
invisible in the current session's UI. This caused silent row loss; see
[[hidden-filters-silent-row-loss]].

## Decision

1. Use three `useState("")` hooks for `t0` (date-from), `t1` (date-to), and
   `symbolFilter`.
2. Render a **Row Filters** card in `src/App.tsx` when rows are loaded.
   The card contains labeled date-from, date-to, and symbol text inputs.
3. Show a **Clear filters** button whenever any filter field is non-empty.
4. On mount, call `localStorage.removeItem("bl.filters.v4")` to purge stale
   values from existing user sessions.

## Rationale

- Invisible state that silently affects output violates the principle of
  least surprise.
- Session-persistent filters add complexity without clear user benefit for
  a tool that is opened on demand against a freshly uploaded log file.
- Removing persistence eliminates the stale-state class of bug entirely.

## Consequences

- Filter state is lost on page refresh. Acceptable: the log file must be
  re-uploaded anyway, so re-entering a filter is a minor extra step.
- No migration path needed: the old localStorage key is actively removed.

## Sources

- `src/App.tsx`
- `CODEX_REVIEW_REPORT.md` (P1)

## Related

- [[hidden-filters-silent-row-loss]] — issue this decision resolves
