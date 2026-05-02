# Wiki change log

Append-only. Newest entries at the top.

## [2026-05-03] ingest | Codex review P1–P8 wiki pages

- Created: `issues/hidden-filters-silent-row-loss.md` — archived issue for
  P1 (stale localStorage filters caused silent row loss).
- Created: `issues/typefilter-toggle-semantics.md` — archived issue for P2
  (TypeFilter toggle logic was inverted).
- Created: `decisions/visible-row-filters.md` — decision to remove
  localStorage filter persistence in favour of visible state-backed inputs.
- Created: `decisions/hidden-types-model.md` — decision to switch TypeFilter
  from "selected shown" to "hidden types" model.
- Created: `decisions/decimal-safe-narrative-accumulation.md` — decision to
  use `decimal.add()` in StoryNarrative for final balance accumulation.
- Created: `issues/open-codex-review-items.md` — active issue tracking P6,
  P9, P10, P11, P12 as still open.
- Updated: `index.md` — added all six new pages under Decisions and Issues.
- Sources: `CODEX_REVIEW_REPORT.md`, `src/App.tsx`,
  `src/components/TypeFilter.tsx`,
  `src/components/story/StoryNarrative.tsx`, `src/lib/balanceLog.ts`,
  `src/lib/format.ts`, `src/main.tsx`.

## [2026-05-03] Codex review P1–P8 fixes

-   Hidden global filters (`bl.filters.v4`) replaced with visible date-range
    and symbol inputs; stale localStorage values can no longer silently drop rows.
-   TypeFilter redesigned: "hidden types" model, Show All / Hide All buttons,
    correct toggle semantics. Old `bl.types.selected` key migrated to `bl.types.hidden`.
-   StoryNarrative shows inline validation errors for baseline, start time, and transfer amount.
-   Final balance accumulation in StoryNarrative now uses `decimal.add()` (decimal-safe).
-   `fmtMoney()` falls back to full precision when `toFixed(2)` rounds tiny values to 0.00.
-   ErrorBoundary wired into `main.tsx`.
-   StoryDrawer lazy-loaded via `React.lazy()` (Recharts excluded from initial bundle).
-   Total tests: 79/79, 0 type errors.

## [2026-05-03] ingest | Knowledge-pipeline alignment

- Source checked: [selmakcby/knowledge-pipeline](https://github.com/selmakcby/knowledge-pipeline),
  including `SKILL.md` and `PROMPTS.md`.
- Updated: `CLAUDE.md` with the three-layer model, role split,
  INGEST / QUERY / LINT workflows, log format, and hard rules.
- Updated: `index.md` into a content catalog with summaries and folder map.
- Created: `sources/external/2026-05-03-knowledge-pipeline.md`.
- Created: `concepts/llm-wiki.md`.
- Created: `decisions/wiki-follows-knowledge-pipeline.md`.
- Created: `lint-report.md`.
- Added: `sources/external/` and `raw/assets/` taxonomy folders with
  `.gitkeep` placeholders.

-   2026-05-02 — Narrative + Event Contracts product fixes from real-user
    feedback. (1) Event Contracts now shows a single per-asset Sent /
    Received / Net table with a Profit/Loss/Break-even verdict, instead
    of two parallel Orders + Payout tables. (2) The "Initial balances
    before the transfer:" intro is now only used when the user actually
    entered a transfer-at-start; otherwise it reads "Initial balances at
    start:" (localized in EN/TR/ES/PT, others fall back to EN via the
    existing spread). (3) The Narrative now always shows the final
    expected wallet balance per asset, computed locally from baseline +
    transfer + activity — no longer depends on the Audit tab being
    rendered first.
-   2026-05-02 — Fixed parser false-positive on type tokens that contain
    a quote-asset substring. `BFUSD_REWARD` was being treated as a
    delivery-symbol candidate because `looksLikeSymbolToken` accepted
    `USD_` followed by any character. The regex now requires the
    underscore to be followed by a digit (`_240329`), so type tokens
    like `BFUSD_REWARD` and `FDUSD_REWARD` parse correctly under the
    headerless heuristic. Added `src/lib/repro.test.ts` covering the
    real diagnostic row 932 plus delivery-symbol guard cases.
-   2026-05-02 - Fixed remaining signed-color gaps: Swaps & Events now
    renders given/received route totals and ledger legs with signed amount
    spans instead of table-cell color classes, and Balance Story Summary
    uses the same amount component. Removed the sticky behavior from the
    Balance Story drawer header so it scrolls naturally with the panel.

-   2026-05-02 - Added consistent signed amount coloring across the
    summary/audit/swap surfaces: positive values use green, negative
    values use red, and zero/missing values stay muted. Reworked Event
    Contracts into two tabs only, Orders and Payout, with orders
    normalized as negative outflows and payouts normalized as positive
    inflows.

-   2026-05-02 - Tightened Swaps & Events design for large logs:
    replaced large per-event cards with a compact route summary plus a
    scrollable event ledger, progressive row reveal, and shorter row
    actions. User-facing summaries now avoid assigning the swap action
    to Binance: "10 USDT was swapped to 0.01511633 BNB."

-   2026-05-02 - Refined Swaps & Events after user review: removed
    peg-difference wording from copyable user answers, kept deeper
    conversion context in an agent-only box, and added on-demand Binance
    Spot 1-second kline checks so agents can compare the conversion
    against the candle high for that exact event second.

-   2026-05-02 — Reworked the Swaps & Events tab for agent-ready
    explanations. Added structured exchange grouping, copyable
    "Binance swapped X into Y" summaries, conversion-rate display, and
    USD-pegged stablecoin difference math for USDT/USDC-style
    conversions. Added tests for peg loss/gain and non-stable swaps.

-   2026-05-02 — Localization regression guard: scanned 653 i18n strings
    across all 10 languages and every source file for U+FFFD, classic
    cp1252-as-utf8 mojibake, and control characters (zero hits). Locked
    it in with `src/lib/i18n.test.ts` (12 tests) covering each language
    and asserting USDⓈ-M is spelled consistently with the U+24C8 form.
    Total tests: 62.
-   2026-05-02 — Story drawer localization pass: replaced mojibake
    translation strings with clean UTF-8 Story/Audit/Charts/Raw labels,
    localized Agent Audit reconciliation UI, added explanatory Chart and
    Summary hints, prevented long numeric cells from wrapping awkwardly,
    and verified Turkish rendering in the in-app browser.
-   2026-05-02 — Sanity pass after parser/reconciliation upgrade:
    fixed no-header type/symbol heuristic, preserved exact `amountStr`
    into the reconciliation UI, made actual-minus-expected decimal-safe,
    avoided excluding stable-asset delivery rows solely by raw type, and
    cleared lint errors.
-   2026-05-02 — Vault initialised. Added project overview, USDⓈ-M
    reconciliation model synthesis, USDⓈ-M-only scope decision,
    dynamic-types and parser-fixed-column issues.
