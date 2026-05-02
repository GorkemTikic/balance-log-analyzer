---
title: TypeFilter toggle semantics were inverted
type: issue
status: archived
date: 2026-05-03
updated: 2026-05-03
tags:
  - balance-log
  - ui
  - typefilter
  - bug
source:
  - src/components/TypeFilter.tsx
  - src/App.tsx
related:
  - "[[hidden-types-model]]"
  - "[[open-codex-review-items]]"
---

# TypeFilter toggle semantics were inverted

## Summary

`TypeFilter` used a "selected shown" model where an empty set meant "show
all". The toggle function, when invoked on the initial empty-set state,
added the clicked type to the set — making only that single type visible
rather than hiding just that one type. The **Select All** and **Clear**
buttons were both semantically equivalent (both produced "show all"), and
there was no way to actually hide a type intuitively.

This was priority item **P2** from the Codex review report
(`CODEX_REVIEW_REPORT.md`).

## Problem detail

In `src/components/TypeFilter.tsx`:

- State: `selectedTypes: string[]` where empty = show all.
- Toggle behaviour on empty set: click type X → `selectedTypes = [X]`,
  making only X visible. User expectation: click X → hide X, everything
  else still visible.
- **Select All** called `setSelectedTypes([])` (show all).
- **Clear** called `setSelectedTypes(detectedTypes)` (also show all, because
  "all selected" equals "show all" in this model).
- Net result: both buttons did the same thing; no action could hide a type.
- localStorage key `bl.types.selected` stored the selected array.

## Fix (resolved 2026-05-03)

Switched to a **hidden types** model. See [[hidden-types-model]] for the
full decision rationale.

- State: `hiddenTypes: Set<string>` where empty set = show all (fast path
  preserved).
- Toggle: adds/removes from `hiddenTypes`. Clicking a visible type hides
  only that type.
- Buttons renamed **Show All** (clears hidden set, disabled when already
  empty) and **Hide All** (adds all detected types to hidden set, disabled
  when all already hidden).
- localStorage key migrated from `bl.types.selected` to `bl.types.hidden`.

## Sources

- `src/components/TypeFilter.tsx`
- `src/App.tsx`
- `CODEX_REVIEW_REPORT.md` (P2)

## Related

- [[hidden-types-model]] — decision page for the model switch
- [[open-codex-review-items]] — remaining open items from the same review
