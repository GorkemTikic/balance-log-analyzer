---
title: Project overview
type: synthesis
status: active
date: 2026-05-02
updated: 2026-05-02
tags:
  - balance-log
  - architecture
source:
  - src/lib/balanceLog.ts
  - src/App.tsx
  - src/components/story/StoryAudit.tsx
related:
  - "[[usds-m-reconciliation-model]]"
  - "[[usds-m-only-scope]]"
---

## Summary

Browser-only React/TypeScript dashboard that parses one page of a
Binance USDⓈ-M Futures Balance Log pasted by the user, separates every
detected balance-log `type`, and reconciles the expected wallet balance
against an optional user-provided actual wallet.

## Components

-   **Parser & classifier** – `src/lib/balanceLog.ts`. Header-driven
    column detection with heuristic fallback, `decideScope()` for
    USDⓈ-M / Coin-M routing, and a fixed-precision BigInt-backed
    `decimal.add` helper.
-   **Reconciliation** – `reconcileUsdMFuturesBalance()` in the same
    module. Pure function: `(rows, startTs, endTs?, baseline?,
    transferAtStart?, currentWallet?, tolerance?) → ReconcileResult`.
-   **UI shell** – `src/App.tsx` orchestrates filters, type selection,
    KPIs, tabs (Summary / Symbol / Swaps / Diagnostics).
-   **Story drawer** – `src/components/StoryDrawer.tsx` and the
    `src/components/story/*` views. The Audit tab now contains the
    USDⓈ-M reconciliation table.
-   **Diagnostics** – Diagnostics tab (`App.tsx`) lists totals,
    excluded-with-reason rows, invalid rows, raw types and warnings.

## Privacy posture

All processing is local; no network calls in the parsing/reconciliation
paths.

## Sources

-   `src/lib/balanceLog.ts`
-   `src/App.tsx`
-   `src/components/story/StoryAudit.tsx`
-   [USDⓈ-M reconciliation model](usds-m-reconciliation-model.md)

## Related

- [[usds-m-reconciliation-model]]
- [[usds-m-only-scope]]
