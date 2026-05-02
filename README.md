# Balance Log Analyzer

A privacy-focused dashboard for analysing the **Binance USDⓈ-M Futures**
Balance Log, separating every detected balance-log type, and reconciling
the expected wallet balance against the user's actual wallet. All
processing happens locally in the browser.

## Scope

-   **USDⓈ-M Futures only.** Coin-M / delivery futures rows are detected
    and excluded from the wallet maths; they are still listed in the
    Diagnostics tab with the exclusion reason.
-   **Resilient parser.** Header reorder, rename, removal, addition, or
    completely missing headers are all handled. Unknown raw types do not
    break parsing — they appear in the summary and Diagnostics.
-   **Decimal-safe arithmetic.** Reconciliation uses string-based
    fixed-precision arithmetic to avoid floating-point drift when
    summing many small fees.

## Features

-   Parses pasted **HTML tables, TSV, CSV, and whitespace-aligned text**.
-   Preserves the **exact raw `type` string** from the log; an extra
    classifier maps each row to a broad category for charts but the UI
    keeps the original type name.
-   **Never silently drops rows.** Every input row becomes either an
    included row, an excluded row (with reason), or an invalid row
    (with reason).
-   **Reconciliation panel** with baseline, transfer-at-start, current
    wallet inputs, and a per-asset mismatch table.
-   **Diagnostics tab** showing total / included / excluded / invalid
    rows, detected raw types, unknown types, parser warnings, and a
    duplicate-transfer warning when transfer-at-start may overlap a
    real `TRANSFER` row.

## How to use

1. Open the Binance Futures Balance Log page.
2. Select all rows in the table and copy.
3. Click the **paste box** in the analyzer and press **Ctrl/⌘+V**.
4. Click **Use & Parse**.
5. Open **Balance Story → Agent Audit**.
6. Enter the **Start time** (UTC+0). Optionally enter:
   -   **Initial / baseline balances** — what you held at start.
   -   **Transfer at start** — a deposit or withdrawal made at the
       anchor moment, as one signed amount per asset.
   -   **Current wallet balances** — to compare expected vs actual.
7. The reconciliation table shows
   `Expected = Baseline + Transfer-at-start + Activity`,
   the actual you entered, and the per-asset status.

## Glossary

-   **Baseline** – wallet balance before the start time. If empty, the
    audit rolls from zero (showing pure activity).
-   **Transfer at start** – a deposit/withdrawal applied at the anchor
    time. Use this when the log starts after a transfer or when you
    want to model "I transferred X right at the start".
-   **Activity** – the sum of all included balance-log amounts in the
    `[start, end]` window.
-   **Current wallet balance** – what your wallet actually shows now.
-   **Expected** – what the wallet *should* show given baseline +
    transfer + activity.
-   **Mismatch** – `expected - actual` exceeds the tolerance (default
    `1e-6`).

## Tech stack

-   **Framework**: React 18 + Vite 5
-   **Language**: TypeScript
-   **Testing**: Vitest
-   **Linting**: ESLint + Prettier

## 🛠 Tech Stack

-   **Framework**: [React 18](https://reactjs.org/) + [Vite 5](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: Custom CSS (Variables, Glassmorphism, Responsive Grid)
-   **Testing**: [Vitest](https://vitest.dev/)
-   **Linting**: ESLint + Prettier

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18 or higher recommended)
-   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/GorkemTikic/balance-log-analyzer.git
    cd balance-log-analyzer
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
```
Artifacts will be generated in the `dist/` directory.

### Run Tests
```bash
npm run test
```

## 📂 Project Structure

A detailed breakdown of the codebase for developers and AI assistants.

### Core (`src/`)
-   **`App.tsx`**: The main application controller. Handles state for the log data, filters, and renders the main grid layout.
-   **`main.tsx`**: Entry point. Mounts the React app.
-   **`styles.css`**: Global design system. Defines CSS variables for the premium dark theme (`--bg`, `--panel`, `--primary`) and utility classes (`.card`, `.btn`, `.input-block`, `.text-green`).

### Logic Libraries (`src/lib/`)
-   **`balanceLog.ts`**: Pure parser, classifier, scope-decider, and
    `reconcileUsdMFuturesBalance()` reconciliation. All maths is
    decimal-safe (BigInt-backed fixed precision). Fully covered by
    `balanceLog.test.ts`.
-   **`format.ts`**: Centralized number formatting.
    -   `fmtTrim(n)`: Intelligent trimming for balances (handles scientific notation).
    -   `fmtMoney(n, asset)`: Standard currency display.
    -   `fmtSigned(n)`: Adds `+` or `−` signs explicitly.
-   **`story.ts`**: The brain of the narrative engine.
    -   `composeNarrative()`: Generates the text summary.
    -   `buildAudit()`: Replays every transaction to calculate theoretical balances.
    -   `parseUTC()` / `parseBaseline()`: Parsers for user input strings.
-   **`i18n.ts`**: Localization strings (English, Turkish, Spanish, etc.).

### Components (`src/components/`)
#### Data & Visualization
-   **`SymbolTable.tsx`**: The main dashboard table showing performance per symbol (PnL, Fees, Volume).
-   **`SwapsEvents.tsx`**: Specialized tables for "Coin Swaps" and "Event Artifacts".
-   **`FilterBar.tsx`**: Top-level KPI stats (Net PnL, Fees Paid) and global filters.
-   **`charts/SimpleCharts.tsx`**: Lightweight Canvas-based line and bar charts.

#### Story Mode (`src/components/story/`)
Refactored into sub-components for maintainability:
-   **`StoryDrawer.tsx`**: The parent modal/drawer. Manages state (tabs, inputs) and persistence.
-   **`StoryNarrative.tsx`**: Generates the "friendly story" text and summary table.
-   **`StoryAudit.tsx`**: Interface for the cryptographic-style balance audit.
-   **`StoryCharts.tsx`**: Visualizations specific to the narrative timeframe.
-   **`StoryRaw.tsx`**: Debug view for raw ledger data.

#### UI Utilities
-   **`GridPasteBox.tsx`**: The drag-and-drop zone for uploading log files.
-   **`RpnCard.tsx` / `RpnTable.tsx`**: Generic UI wrappers for cards and tables.
-   **`ExportPNG.tsx`**: Utility to screenshot DOM elements.

### Hooks (`src/hooks/`)
-   **`useLocalStorage.ts`**: robust hook for persisting state to browser storage with error handling.

## 🤝 Contributing

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
