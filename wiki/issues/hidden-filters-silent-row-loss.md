---
title: Hidden global filters caused silent row loss
type: issue
status: archived
date: 2026-05-03
updated: 2026-05-03
tags:
  - balance-log
  - filters
  - localStorage
  - bug
source:
  - src/App.tsx
related:
  - "[[visible-row-filters]]"
  - "[[open-codex-review-items]]"
---

# Hidden global filters caused silent row loss

## Summary

The `bl.filters.v4` localStorage key stored `t0`, `t1`, and `symbol` filter
values across browser sessions. The getter was wired up but the setter was
discarded (`const [filters] =`), so there was no UI element to set or clear
these values. A user returning with stale values from a prior session would
see rows silently disappear with no visual indication that a filter was
active.

This was priority item **P1** from the Codex review report
(`CODEX_REVIEW_REPORT.md`).

## Problem detail

In `src/App.tsx` the filters were read from localStorage via a custom hook
but never written back. Because the filter state was invisible:

- Rows could disappear from the table for no apparent reason.
- There was no "filter active" indicator, no clear button, and no way to
  reset the filters other than manually clearing localStorage.
- The bug was latent: a fresh session with no stale key worked fine, hiding
  the defect during development.

## Fix (resolved 2026-05-03)

- Replaced the localStorage-backed filter state with three plain
  `useState("")` hooks for `t0`, `t1`, and `symbolFilter`.
- Added a visible **Row Filters** card in the UI, rendered only when rows
  are loaded, containing date-from, date-to, and symbol text inputs.
- A **Clear filters** button appears whenever any filter field is non-empty.
- A `useEffect` on mount calls `localStorage.removeItem("bl.filters.v4")` to
  purge stale keys from existing user sessions.

The decision to remove localStorage persistence entirely is recorded in
[[visible-row-filters]].

## Sources

- `src/App.tsx`
- `CODEX_REVIEW_REPORT.md` (P1)

## Related

- [[visible-row-filters]] — decision page for removing filter persistence
- [[open-codex-review-items]] — remaining open items from the same review
