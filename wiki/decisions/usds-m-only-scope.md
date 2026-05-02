---
title: Scope is USDⓈ-M Futures only
type: decision
status: active
date: 2026-05-02
updated: 2026-05-02
tags:
  - usds-m
  - scope
source:
  - src/lib/balanceLog.ts
  - src/lib/balanceLog.test.ts
related:
  - "[[usds-m-reconciliation-model]]"
  - "[[project-overview]]"
---

## Summary

The wallet-reconciliation maths is restricted to USDⓈ-M Futures rows.
Coin-M / delivery rows are detected and *excluded with a reason*, never
silently dropped.

## Rationale

Coin-M settlement is denominated in the underlying coin (BTC, ETH, …),
while USDⓈ-M is denominated in stable / quote assets (USDT, USDC,
BFUSD, FDUSD, …). Mixing them produces a meaningless "expected
balance" — adding negative fractional BTC to a USDT wallet has no
physical interpretation. Users debugging discrepancies in their
**USDⓈ-M** wallet are best served by an audit that first quarantines
Coin-M activity.

## Heuristic implemented

`decideScope()` in `src/lib/balanceLog.ts`:

1. Coin-M markers in `symbol`, `type`, or raw row text
   (`COIN_PERP`, `_PERP`, `_YYMMDD`, `COIN_M`) →
   `scope: "COINM"`.
2. Asset in the curated USDⓈ-M-quote set (USDT, USDC, BUSD, BFUSD,
   FDUSD, TUSD, USDP, DAI, USDE, USD1, BNFCR, LDUSDT, plus BNB for fee
   discounts) → `scope: "USDM"`.
3. Asset matches a known coin name (BTC, ETH, SOL, …) → `scope:
   "COINM"`.
4. Otherwise unfamiliar but asset-shaped → `scope: "UNKNOWN"`,
   *included* with a warning. Errs on the side of preserving wallet
   accuracy when Binance adds new stables.

## Consequences

-   Diagnostics tab surfaces every excluded row with the matched
    reason so users can sanity-check the routing.
-   New stables added by Binance will surface in `unknownTypes`-style
    warnings rather than dropping out of the maths.
-   A delivery-style raw type is not enough by itself to exclude a
    stable-asset row; stable-settled delivery rows stay in USDⓈ-M
    maths unless the symbol/raw contract marker is Coin-M-shaped.

## Sources

-   `src/lib/balanceLog.ts` (`decideScope`, `USDM_QUOTE_ASSETS`,
    `COINM_HINT_RE`)
-   `src/lib/balanceLog.test.ts` (Coin-M exclusion tests)

## Related

- [[usds-m-reconciliation-model]]
- [[project-overview]]
