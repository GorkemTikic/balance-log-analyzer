---
title: USDⓈ-M reconciliation model
type: synthesis
status: active
date: 2026-05-02
updated: 2026-05-02
tags:
  - reconciliation
  - math
  - usds-m
source:
  - src/lib/balanceLog.ts
  - src/lib/balanceLog.test.ts
  - src/components/story/StoryAudit.tsx
related:
  - "[[project-overview]]"
  - "[[usds-m-only-scope]]"
---

## Summary

The reconciliation contract is:

```
expectedFinal[asset] =
    baseline[asset]
  + transferAtStart[asset]
  + Σ ( amount of every included row in [startTs, endTs] for asset )
```

`baseline`, `transferAtStart`, and `currentWallet` are all per-asset and
all optional. When `baseline` is empty, the formula rolls from zero.

## Inputs

| Input | Description | Default |
| --- | --- | --- |
| `rows` | `ParsedRow[]`, already filtered to USDⓈ-M scope | required |
| `startTs` | epoch millis (UTC) of the anchor | required |
| `endTs` | epoch millis (UTC) inclusive upper bound | latest row |
| `baseline` | `{ asset: number\|string }` | `{}` |
| `transferAtStart` | `{ asset, amount }` | `undefined` |
| `currentWallet` | `{ asset: number\|string }` for comparison | `undefined` |
| `tolerance` | absolute match tolerance | `1e-6` |

## Outputs

`ReconcileResult.perAsset[asset]` is an `AssetReconcile`:

-   `baseline`, `transferAtStart`, `activity`, `expected`,
    `actual?`, `difference?` – decimal strings (BigInt fixed precision).
-   `status` – `match`, `mismatch`, or `unknown` if no actual was given.

`ReconcileResult.warnings` carries free-text alerts including the
duplicate-transfer-at-start warning that fires when an existing
`TRANSFER` row at start matches asset+amount within ±60 s and tolerance.

## Why decimal-safe arithmetic

Floating-point summation drifts when summing thousands of small
funding/commission rows. The module uses a string→BigInt path with
`DEC_PRECISION = 18` to keep deterministic results without pulling in
a heavy decimal library.

## Sources

-   `src/lib/balanceLog.ts` (`reconcileUsdMFuturesBalance`,
    `decimal.add`)
-   `src/lib/balanceLog.test.ts`
-   `src/components/story/StoryAudit.tsx`

## Related

- [[project-overview]]
- [[usds-m-only-scope]]
