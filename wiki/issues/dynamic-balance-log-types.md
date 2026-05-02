---
title: Dynamic balance-log types
type: issue
status: active
date: 2026-05-02
updated: 2026-05-02
tags:
  - parser
  - dynamic-types
source:
  - src/lib/balanceLog.ts
  - src/components/TypeFilter.tsx
  - src/App.tsx
related:
  - "[[parser-fixed-column-risk]]"
  - "[[project-overview]]"
---

## Summary

Binance routinely adds, renames, and reorganises balance-log row
`type` strings (e.g. `BFUSD_REWARD`, `INTERNAL_AGENT_REWARD`,
`FUTURES_PRESENT_SPONSOR_REFUND`). The application must not depend on a
closed enum or it will silently lose money in the audit.

## Mitigation in code

-   `parseGrid` preserves the **exact raw type** in `ParsedRow.type`.
-   `classifyType` adds a *secondary* broad category, but only for
    grouping in charts and narrative. Wallet maths uses the raw type.
-   Unknown types are pushed into `ParseResult.unknownTypes` and
    surfaced in the Diagnostics tab.
-   The `TypeFilter` component in `App.tsx` is built dynamically from
    `detectedTypes`, so new types appear in the UI automatically.

## Open follow-ups

-   When a brand-new stable asset appears, `decideScope` returns
    `UNKNOWN` and includes it with a warning. Decide whether to grow
    `USDM_QUOTE_ASSETS` automatically or require a manual whitelist
    update.

## Sources

-   `src/lib/balanceLog.ts`
-   `src/components/TypeFilter.tsx`
-   `src/App.tsx` (Diagnostics tab)

## Related

- [[parser-fixed-column-risk]]
- [[project-overview]]
