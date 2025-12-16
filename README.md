# Balance Log Analyzer 📊

A premium, privacy-focused dashboard for analyzing trading logs, auditing balances, and generating performance narratives. Built with React, TypeScript, and a custom glassmorphism dark theme.

## 🌟 Features

-   **Privacy First**: All processing happens locally in your browser. No data is sent to any server.
-   **Log Analysis**: Accurately parses and categorizes trading logs (deposits, withdraws, trades, finding fees, commissions, etc.).
-   **Agent Audit**: Reconstructs your balance history from scratch to verify exchange data integrity.
-   **Narrative Engine**: Generates human-readable summaries of your trading activity (e.g., "You deposited 1000 USDT, traded for BTC, and grew your portfolio by 20%").
-   **Visualizations**: Interactive charts for daily net performance and asset distribution.
-   **Premium UI**: Custom "Slate & Navy" dark mode with glassmorphism effects.

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
