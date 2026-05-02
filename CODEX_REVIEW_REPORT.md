# Codex Review Report

Project reviewed: `balance-log-analyzer-main`
Review date: 2026-05-03

## Scope

Reviewed source, config, CI, docs, and wiki files. Generated/dependency artifacts were not reviewed line by line: `node_modules/`, `dist/`, `*.log`, and `tsconfig.tsbuildinfo`. Those artifacts are present in this folder even though `.gitignore` excludes them, so confirm they are not tracked in the real repository.

## Verification Results

- `npm test`: pass, 9 files / 78 tests.
- `npm run build`: pass, but Vite warns that the main chunk is large: `index-2DA0pTE-.js` is 604.39 kB minified, 188.97 kB gzip.
- `npm run lint`: pass with 14 warnings.
- `npx prettier --check .`: fail, 31 files need formatting.
- `npm audit --audit-level=high`: fail, 9 advisories: 5 high, 4 moderate.
- `npm outdated`: many packages are behind wanted/latest versions; Vite remains on 5.4.21 while latest is 8.0.10.

## Highest Priority Findings

### 1. Hidden persisted date/symbol filters can silently hide parsed rows

Files:

- `src/App.tsx:94-147`
- `src/App.tsx:199`
- `src/components/FilterBar.tsx:30-181`
- `src/components/StoryDrawer.tsx:16-29`

`App` still reads `bl.filters.v4` from localStorage and applies `t0`, `t1`, and `symbol` in `rowsByDateSymbol`. However, the rendered `FilterBar` is no longer a filter bar; it is a collapsed "Performance Highlights" panel and has no controls for date or symbol. If a user has old saved filters, pasted rows can disappear with no visible reason or clear/reset control. `StoryDrawer` also receives `t0`/`t1` but ignores them, so the story/audit inputs are not synchronized with the applied range.

Fix:

- Restore visible date/time and symbol filter controls, including an active-filter summary and a clear-all button.
- Or remove `bl.filters.v4` entirely if global filtering is not wanted.
- Validate the localStorage shape before applying it.
- Rename `FilterBar` to something like `PerformanceHighlights` if it stays as that feature.
- Initialize or explicitly decouple Story start/end from the global range.

### 2. TypeFilter "Clear" does not clear anything and selection semantics are confusing

Files:

- `src/App.tsx:183-207`
- `src/components/TypeFilter.tsx:52-82`

The app uses an empty selected set to mean "all types selected". But the Clear button sets `selectedTypes` to `detectedTypes`, which also shows all rows. So `Select All` and `Clear` are effectively the same state with different labels/counts. From the all-selected state, clicking one type switches to only that type instead of toggling that type off. This is surprising and easy to misread during audits.

Fix:

- Use explicit modes: `all`, `only selected`, and optionally `none`.
- If keeping the current model, rename buttons to "Show all" and "Hide all" and implement hide-all as an explicit empty-results state, not the same state as all.
- Show a clear active-filter badge whenever rows are being filtered by type.

### 3. Invalid baseline/start/end input is silently ignored

Files:

- `src/lib/story.ts:125-151`
- `src/components/story/StoryNarrative.tsx:13-15`
- `src/components/story/StoryAudit.tsx:14-27`

`parseBaseline()` returns `{ error }`, but the UI never displays that error. A mistyped baseline line can make the audit roll from zero or omit balances without warning. `parseTransfer()` and `parseUTC()` have similar "undefined means invalid or blank" behavior, so invalid user input is hard to distinguish from omitted input.

Fix:

- Display inline validation errors for baseline, current wallet, transfer amount/asset, start time, and end time.
- Disable copy/export for invalid audit inputs, or include a visible warning in the output.
- Add tests for invalid baseline and invalid date handling in the React story/audit components or pure helper layer.

### 4. Narrative and audit display math reintroduces floating-point drift

Files:

- `src/components/story/StoryNarrative.tsx:33-50`
- `src/lib/story.ts:331-415`

The core reconciliation function uses decimal-safe string/BigInt arithmetic, but the story final balances and `buildAudit()` final expected balances use JavaScript numbers (`r.amount`, `before + transfer`, `final[a] + assetNet[a]`). That can produce tiny differences from the reconciliation table, especially for thousands of fee/funding rows.

Fix:

- Reuse `reconcileUsdMFuturesBalance()` or the `decimal` helper for narrative/audit final balances.
- Preserve `amountStr` through every final-balance path.
- Add a regression test where many small decimal rows sum exactly in both Reconciliation and Narrative.

### 5. Small crypto fees are rounded to zero in Performance Highlights

Files:

- `src/lib/format.ts:50-52`
- `src/components/FilterBar.tsx:184-214`
- `src/components/charts/PremiumCharts.tsx:12-16`

`fmtMoney()` always uses `toFixed(2)`. That is unsafe for assets like BNB/BTC and for tiny fees. A `-0.0005 BNB` commission displays as `-0.00 BNB`, which is misleading in an audit tool.

Fix:

- Replace `fmtMoney()` with a precision-aware asset formatter.
- Stablecoins can be rounded to 2 or 8 dp depending on context, but volatile assets need trimmed precision.
- Never display nonzero values as `0.00`.

### 6. Exchange events are grouped only by timestamp

File:

- `src/lib/exchangeEvents.ts:134-138`

`buildExchangeEvents()` groups all swap/auto-exchange rows by `row.time`. If two independent conversions happen in the same second, their legs merge into one event, producing incorrect given/received totals and copyable summaries.

Fix:

- Group by a stronger key when available, such as transaction id, adjacent row cluster, uid+time+kind+sign pattern, or a deterministic pairing algorithm.
- If same-second rows cannot be unambiguously paired, show an "ambiguous group" warning instead of presenting it as one clean event.
- Add a test with two same-second conversions.

### 7. The initial bundle loads story/charts dependencies too early

Files:

- `src/App.tsx:5`
- `src/components/StoryDrawer.tsx:6-9`
- `src/components/story/StoryCharts.tsx:4-5`
- `src/components/charts/PremiumCharts.tsx:1-5`

The build succeeds but Vite warns about a 604 kB main chunk. `StoryDrawer` is statically imported by `App`, `StoryDrawer` statically imports every story tab, and `StoryCharts` statically imports Recharts. This means chart/story code is in the initial route even when the drawer is closed.

Fix:

- Lazy-load `StoryDrawer`, `StoryCharts`, and possibly `SwapsEvents`.
- Keep `html2canvas` dynamic imports.
- Add Rollup manual chunks if needed.
- Re-run build and confirm the main chunk drops below the warning threshold.

### 8. ErrorBoundary exists but is not used

Files:

- `src/components/ErrorBoundary.tsx`
- `src/main.tsx:11-14`

Runtime failures in charts, clipboard/export paths, or parsing UI will not be caught by the existing boundary because `main.tsx` renders `<App />` directly.

Fix:

- Wrap `<App />` with `<ErrorBoundary>`.
- Style the fallback so it matches the app and offers a reset/reload action.

### 9. CI/deployment is not reproducible and does not run tests/lint

Files:

- `.github/workflows/pages.yml:21-38`
- `package-lock.json`
- `DEPLOYMENT.md`

The workflow says "LOCK YOK" and runs `npm install`, but the repo has a `package-lock.json`. CI also builds only; it does not run lint, tests, audit, or format check. The docs also describe `npm run deploy` / `gh-pages`, while the workflow uses GitHub Pages artifacts.

Fix:

- Use `npm ci` with npm cache enabled.
- Add `npm run lint`, `npm test`, `npx prettier --check .`, and ideally `npm audit --audit-level=high` or a documented security policy.
- Update deployment docs to match the GitHub Actions path.
- Decide whether `gh-pages` deploy remains supported; if not, remove the dependency/script.

### 10. Dependency/security hygiene needs attention

Files:

- `package.json`
- `package-lock.json`

`npm audit --audit-level=high` currently fails. High advisories include transitive issues in `flatted`, `minimatch`, `picomatch`, and `rollup`. The audit also reports vulnerable Vite/esbuild ranges. `npm outdated` shows the project is behind on Vite, Vitest, Recharts, TypeScript tooling, jsdom, and React ecosystem packages.

Fix:

- First try `npm audit fix`.
- For Vite/esbuild, choose whether to stay on a patched Vite 5/6/7 line or migrate to Vite 8 deliberately.
- Re-run tests/build after dependency updates.

## Design and UX Improvements

- The current UI is a generic glassy dark dashboard. For an audit/reconciliation tool, move toward a denser operational layout: a persistent top control bar, clear parse/filter status, compact tables, and less glow.
- Avoid nested card-heavy composition. Several surfaces put cards inside cards, which makes the app feel heavier than the data requires.
- Replace blocking `alert()` calls with non-blocking toast/status messages.
- Add a clear first-run empty state: paste data, parse status, diagnostics summary, and next best action.
- Add visible "active filters" chips and row-count deltas near the tables.
- Improve drawer accessibility: Escape-to-close, focus trap, return focus to the opener, `aria-label`/`aria-labelledby`, and background inert behavior.
- Add more responsive table affordances for mobile: sticky first column, clearer horizontal scroll hints, and tighter column presets.
- Consider a left or top navigation model for Story/Audit/Charts/Raw if the drawer keeps growing.

## File-by-File Notes

- `src/App.tsx`: Main orchestration is understandable, but stale hidden filters and duplicated `useLocalStorage` are the biggest issues.
- `src/components/FilterBar.tsx`: Name is stale; component is performance highlights, not filters. Uses 2-decimal money formatting.
- `src/components/TypeFilter.tsx`: Selection model needs a redesign.
- `src/components/GridPasteBox.tsx`: Paste path is safe enough, but comments are noisy and accessibility could improve.
- `src/components/SymbolTable.tsx`: Feature rich, but has inline styles, `alert()` UX, `any`, and old patch comments. PNG export should be tested with long/wide tables.
- `src/components/SwapsEvents.tsx`: Good progressive reveal design. Needs better copy status UX and safer exchange grouping.
- `src/components/StoryDrawer.tsx`: Good split into tabs, but unused `t0`/`t1`, loose `any`, custom SVG close icon, and modal accessibility gaps.
- `src/components/story/StoryNarrative.tsx`: Needs input validation and decimal-safe final balances.
- `src/components/story/StoryAudit.tsx`: Strong reconciliation table, but invalid inputs are not surfaced.
- `src/components/story/StoryCharts.tsx`: Pulls Recharts into the main bundle through static imports.
- `src/components/story/StoryRaw.tsx`: The Raw tab does not show raw rows; it only shows a hint. Either implement raw/diagnostic content or remove/rename the tab.
- `src/components/charts/SimpleCharts.tsx`: Helper exports trigger Fast Refresh warnings. Move helper functions to a non-component module.
- `src/components/charts/PremiumCharts.tsx`: Needs typed tooltip props and precision-aware formatting.
- `src/components/ErrorBoundary.tsx`: Useful but unused.
- `src/hooks/useLocalStorage.ts`: Duplicate of the hook embedded in `App.tsx`; centralize.
- `src/lib/balanceLog.ts`: Strongest part of the project. Parser/reconciliation design is good and tested.
- `src/lib/story.ts`: Contains stale development comments and number-based final balance math.
- `src/lib/exchangeEvents.ts`: Needs same-second ambiguity handling.
- `src/lib/eventContracts.ts`: Consider testing mixed positive/negative totals for the same asset.
- `src/lib/spotMarket.ts`: Network feature is isolated and on-demand. UI should make external call behavior explicit.
- `src/lib/format.ts`: Replace `fmtMoney()` with asset-aware formatting.
- Tests in `src/lib/*.test.ts`: Solid parser coverage. Missing UI-state tests for filters/type filters/story validation.
- `src/styles.css`: Cohesive but over-carded and heavily dark/slate. Several components rely on inline styles instead of reusable classes.
- `.github/workflows/pages.yml`: Use lockfile and add test/lint/format gates.
- `README.md`: Stale and duplicated. It claims global filters, drag/drop upload, and raw ledger debugging that the current UI does not provide.
- `DEPLOYMENT.md`: Conflicts with GitHub Actions deploy path.
- `wiki/*`: Useful project memory, but formatting drifts and some claims are stale after the market-check feature.

## Ready-to-Paste Prompt for Claude

Please update this React/Vite TypeScript project based on the review below. Preserve the existing parser/reconciliation behavior unless a listed bug requires changing it. Keep changes focused, add tests for behavior changes, and run `npm run lint`, `npm test`, `npm run build`, `npx prettier --check .`, and `npm audit --audit-level=high` before finishing.

Priority fixes:

1. Restore or remove the hidden global filters. `src/App.tsx` currently reads `bl.filters.v4` and applies `t0`, `t1`, and `symbol`, but the UI has no controls to edit/clear them. Add visible date/time and symbol filter controls with active-filter chips and a clear-all action, or remove this localStorage filter path entirely. Rename `FilterBar` if it remains a performance highlights component. Ensure old localStorage values cannot silently hide rows.
2. Redesign `TypeFilter`. Empty selected set currently means "all", but the Clear button sets every detected type, which is also "all". Make the model explicit and intuitive: Show all, Hide all, and selected-only states should behave exactly as labeled. Add tests for selecting, clearing, and changing data sets.
3. Surface invalid story/audit inputs. `parseBaseline()` returns errors that are ignored. Show inline errors for baseline/current wallet lines, start/end timestamps, and transfer amount/asset. Do not let invalid input silently roll from zero or omit balances.
4. Make narrative/audit final balances decimal-safe. Reuse `reconcileUsdMFuturesBalance()` or the `decimal` helper instead of summing `r.amount` with JavaScript numbers in `StoryNarrative` and `buildAudit`.
5. Replace `fmtMoney()` fixed 2-decimal formatting with asset-aware precision so small nonzero crypto fees never display as `0.00`.
6. Fix exchange event grouping. `buildExchangeEvents()` groups only by timestamp, which can merge separate conversions in the same second. Use a stronger grouping/pairing strategy or flag ambiguous same-second groups. Add a regression test.
7. Reduce the initial bundle. Lazy-load `StoryDrawer`, `StoryCharts`, and Recharts-heavy code. Keep `html2canvas` dynamic. Confirm the Vite main chunk warning is gone or meaningfully reduced.
8. Use `ErrorBoundary` in `main.tsx` and give the fallback a styled reset/reload action.
9. Clean CI/deployment. Use `npm ci` and npm cache in `.github/workflows/pages.yml`; add lint, tests, build, and format checks. Decide whether the `gh-pages` script is still needed and update docs accordingly.
10. Resolve dependency audit issues as far as possible without unsafe forced upgrades. Document any remaining advisory and why it remains.
11. Run Prettier and remove stale "PATCHED", "Wait", and "removed" comments.
12. Redesign the visual system toward a dense operational audit tool: less glass/glow, fewer nested cards, clearer status/control hierarchy, non-blocking toasts instead of alerts, accessible modal behavior, responsive tables, and obvious next actions after paste.

Acceptance criteria:

- No hidden persisted filters can affect results without visible UI.
- Invalid audit inputs are impossible to miss.
- Decimal-safe reconciliation, audit preview, and narrative final balances agree.
- Small nonzero fees remain visible with appropriate precision.
- Same-second exchange rows do not get falsely merged without warning.
- `npm test`, `npm run build`, `npm run lint`, and `npx prettier --check .` pass.
- `npm audit --audit-level=high` passes, or any remaining advisory is explicitly documented with a safe plan.
- README, DEPLOYMENT, and wiki notes match the actual UI and deploy flow.
