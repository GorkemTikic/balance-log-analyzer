---
title: TypeFilter uses hidden-types model instead of selected-shown model
type: decision
status: active
date: 2026-05-03
updated: 2026-05-03
tags:
  - balance-log
  - typefilter
  - ui
  - localStorage
source:
  - src/components/TypeFilter.tsx
  - src/App.tsx
related:
  - "[[typefilter-toggle-semantics]]"
---

# TypeFilter uses hidden-types model instead of selected-shown model

## Summary

`TypeFilter` now stores `hiddenTypes: Set<string>` — the set of types to
exclude. Empty set means "show all". Previously it stored
`selectedTypes: string[]` where empty also meant "show all", but the toggle
logic was inverted and the buttons were semantically identical.

## Context

The prior "selected shown" model had broken toggle semantics: clicking a
type when nothing was selected added it to `selectedTypes`, making only that
type visible instead of hiding it. See [[typefilter-toggle-semantics]] for
the full defect description.

## Decision

1. Replace `selectedTypes: string[]` with `hiddenTypes: Set<string>` in
   `src/components/TypeFilter.tsx`.
2. **Toggle** adds the type to `hiddenTypes` if currently shown, removes it
   if currently hidden. Empty set fast-path preserved: when `hiddenTypes` is
   empty, no filtering occurs and no Set iteration is needed.
3. Rename **Select All** → **Show All**: clears `hiddenTypes`. Disabled when
   the set is already empty.
4. Rename **Clear** → **Hide All**: adds all detected types to `hiddenTypes`.
   Disabled when all detected types are already hidden.
5. Migrate localStorage key from `bl.types.selected` to `bl.types.hidden`.
   Old key is not explicitly purged (safe: new key is written on first
   interaction; stale selected key has no effect under the new model).

## Rationale

- The "hidden" model matches user mental model: clicking a visible type
  should hide it.
- Empty-set-means-show-all is preserved in both models, so the fast-path
  performance characteristic is unchanged.
- Renaming the buttons to Show All / Hide All makes their effect
  unambiguous regardless of prior selection state.

## Consequences

- The localStorage key name changes. Users with an existing `bl.types.selected`
  key will see all types on first load (the key is simply ignored), which is
  the correct default.

## Sources

- `src/components/TypeFilter.tsx`
- `src/App.tsx`
- `CODEX_REVIEW_REPORT.md` (P2)

## Related

- [[typefilter-toggle-semantics]] — issue this decision resolves
