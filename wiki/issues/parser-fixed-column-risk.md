---
title: Parser fixed-column risk (historical)
type: issue
status: active
date: 2026-05-02
updated: 2026-05-02
tags:
  - parser
  - risk
source:
  - src/lib/balanceLog.ts
  - src/lib/balanceLog.test.ts
related:
  - "[[dynamic-balance-log-types]]"
  - "[[project-overview]]"
---

## Summary

The original `parseBalanceLog()` in `src/App.tsx` assumed a fixed
column order (`[id, uid, asset, type, amount, …, time, symbol]`) and
silently `continue`-d on malformed lines. Any reorder by Binance, or a
copy-paste path that re-shuffled columns, broke the entire audit
without surfacing a warning.

## Resolution

Replaced by `parseText` / `parseGrid` in `src/lib/balanceLog.ts`:

-   Tries a header-based column map first (`detectHeader`), accepting a
    permissive set of aliases for each field.
-   Falls back to a position-aware heuristic that locates the timestamp
    cell, then identifies type, asset, and amount via shape heuristics.
-   Every row that fails parsing becomes an entry in
    `ParseResult.invalid` with a reason — never silently dropped.

## Residual risk

-   The heuristic fallback can still misidentify amount when the row
    has unusual shape (e.g. amount and id both 4-digit positive
    integers). When `parseMeta.headerUsed` is `null`, the Diagnostics
    tab now flags this so the user can re-copy with the header row.
-   2026-05-02 sanity pass fixed a no-header edge where broad asset
    detection could cause `TRANSFER` to be skipped as a type and
    `BTCUSDT` to be selected as the fallback type. The heuristic now
    separates type-shaped tokens from symbol/pair-shaped tokens.

## Sources

-   `src/lib/balanceLog.ts` (`parseRowWithHeader`,
    `parseRowHeuristic`, `detectHeader`)
-   `src/lib/balanceLog.test.ts` (header reorder, missing columns,
    split date/time)

## Related

- [[dynamic-balance-log-types]]
- [[project-overview]]
