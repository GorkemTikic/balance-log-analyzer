// src/App.tsx
import React, { useMemo, useState, useEffect, lazy, Suspense } from "react";
import GridPasteBox from "@/components/GridPasteBox";
import FilterBar from "@/components/FilterBar";
import SwapsEvents from "@/components/SwapsEvents";
import SymbolTable from "@/components/SymbolTable";
import RpnTable from "@/components/RpnTable";
import Tabs, { TabKey } from "@/components/Tabs";
import KpiStat from "@/components/KpiStat";
import TypeFilter from "@/components/TypeFilter";
import type { Row } from "@/lib/story";
import { parseText, type ParseResult } from "@/lib/balanceLog";
import { buildExchangeEvents } from "@/lib/exchangeEvents";

// P7: lazy-load the heavy drawer so the initial bundle excludes Recharts
const StoryDrawer = lazy(() => import("@/components/StoryDrawer"));

type TotalsMap = Record<string, { pos: number; neg: number; net: number }>;
type TotalsByType = Record<string, TotalsMap>;

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Browser storage can be unavailable in private or restricted contexts.
    }
  }, [key, value]);
  return [value, setValue] as const;
}

function parseUTC(s: string) {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return NaN;
  const [, Y, Mo, D, H, Mi, S] = m;
  return Date.UTC(+Y, +Mo - 1, +D, +H, +Mi, +S);
}

function parseBalanceLog(text: string): { rows: Row[]; meta: ParseResult } {
  const meta = parseText(text);
  const rows: Row[] = meta.included.map((p) => ({
    id: p.id,
    uid: p.uid,
    asset: p.asset,
    type: p.type,
    amountStr: p.amountStr,
    amount: p.amount,
    time: p.time,
    ts: p.ts,
    symbol: p.symbol,
    extra: p.extra,
    raw: p.raw
  }));
  return { rows, meta };
}

function sumByAsset(rows: Row[]): TotalsMap {
  const acc: TotalsMap = {};
  for (const r of rows) {
    const a = (acc[r.asset] ||= { pos: 0, neg: 0, net: 0 });
    if (r.amount >= 0) a.pos += r.amount;
    else a.neg += Math.abs(r.amount);
    a.net += r.amount;
  }
  return acc;
}

function groupByTypeAndAsset(rows: Row[]): TotalsByType {
  const map = new Map<string, Row[]>();
  for (const r of rows) {
    const key = r.type || "(unknown)";
    (map.get(key) || map.set(key, []).get(key)!)!.push(r);
  }
  const out: TotalsByType = {};
  for (const [t, list] of map.entries()) out[t] = sumByAsset(list);
  return out;
}

function humanize(t: string) {
  return t.replace(/_/g, " ").replace(/\b([a-z])/g, (s) => s.toUpperCase());
}

export default function App() {
  const [rawRows, setRows] = useState<Row[]>([]);
  const [parseMeta, setParseMeta] = useState<ParseResult | null>(null);
  const [error, setError] = useState("");

  // P1: Visible date/symbol filters — plain state, not localStorage.
  // Storing these in localStorage caused stale values to silently hide rows with no UI to clear them.
  const [t0, setT0] = useState("");
  const [t1, setT1] = useState("");
  const [symbolFilter, setSymbolFilter] = useState("");

  // P2: Hidden-types model — empty set means show all (fast path).
  // Replaced the old "selected types" model which had confusing toggle semantics.
  const [hiddenTypes, setHiddenTypes] = useLocalStorage<readonly string[]>("bl.types.hidden", []);
  const hiddenTypeSet = useMemo(() => new Set(hiddenTypes), [hiddenTypes]);

  const [tab, setTab] = useState<TabKey>("summary");
  const [drawerOpen, setDrawerOpen] = useLocalStorage<boolean>("bl.story.open", false);

  // One-time migration: remove stale keys from older versions.
  useEffect(() => {
    localStorage.removeItem("bl.filters.v4");
    localStorage.removeItem("bl.types.selected");
  }, []);

  function runParse(tsv: string) {
    try {
      const { rows: rs, meta } = parseBalanceLog(tsv);
      setRows(rs);
      setParseMeta(meta);
      const problems = meta.invalid.length + meta.excluded.length;
      if (!rs.length) {
        setError(
          problems
            ? `No USDⓈ-M rows detected. ${meta.excluded.length} excluded, ${meta.invalid.length} invalid — see Diagnostics.`
            : "No valid rows detected."
        );
      } else {
        setError("");
      }
    } catch (e: any) {
      setError(e?.message || String(e));
      setRows([]);
      setParseMeta(null);
    }
  }

  const rowsByDateSymbol = useMemo(() => {
    const ts0 = t0 ? parseUTC(t0) : -Infinity;
    const ts1 = t1 ? parseUTC(t1) : Infinity;
    const sym = symbolFilter.trim().toUpperCase();
    return rawRows.filter((r) => {
      if (!(r.ts >= ts0 && r.ts <= ts1)) return false;
      if (sym && !(r.symbol || "").toUpperCase().includes(sym)) return false;
      return true;
    });
  }, [rawRows, t0, t1, symbolFilter]);

  const detectedTypes = useMemo(() => {
    const s = new Set<string>();
    for (const r of rowsByDateSymbol) s.add(r.type || "(unknown)");
    return Array.from(s).sort();
  }, [rowsByDateSymbol]);

  // P2: filter excludes hidden types instead of keeping only selected types
  const rows = useMemo(() => {
    if (hiddenTypeSet.size === 0) return rowsByDateSymbol;
    return rowsByDateSymbol.filter((r) => !hiddenTypeSet.has(r.type || "(unknown)"));
  }, [rowsByDateSymbol, hiddenTypeSet]);

  const totalsByType = useMemo(() => groupByTypeAndAsset(rows), [rows]);

  const coinSwapEvents = useMemo(() => buildExchangeEvents(rows, "coinSwap"), [rows]);
  const autoExchangeEvents = useMemo(() => buildExchangeEvents(rows, "autoExchange"), [rows]);
  const eventsOrdersByAsset = useMemo(() => sumByAsset(rows.filter((r) => r.type === "EVENT_CONTRACTS_ORDER")), [rows]);
  const eventsPayoutsByAsset = useMemo(
    () => sumByAsset(rows.filter((r) => r.type === "EVENT_CONTRACTS_PAYOUT")),
    [rows]
  );

  const kpiTotal = rawRows.length;
  const kpiFiltered = rows.length;
  const kpiSymbols = new Set(rows.map((r) => r.symbol).filter(Boolean)).size;

  const typeOrder = useMemo(() => {
    const entries = Object.entries(totalsByType);
    const magnitude = (m: TotalsMap) => Object.values(m).reduce((a, v) => a + Math.abs(v.net) + v.pos + v.neg, 0);
    return entries.sort((a, b) => magnitude(b[1]) - magnitude(a[1]));
  }, [totalsByType]);

  const typeCounts = useMemo(
    () =>
      rowsByDateSymbol.reduce((acc: Record<string, number>, r) => {
        const k = r.type || "(unknown)";
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {}),
    [rowsByDateSymbol]
  );

  const hasActiveFilters = !!(t0 || t1 || symbolFilter);

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1 className="title">FD Balance Log Analyzer</h1>
          <div className="subtitle">One Page Summary</div>
        </div>
        <div className="toolbar">
          <button className="btn btn-dark" onClick={() => setDrawerOpen(true)}>
            Open Balance Story
          </button>
        </div>
      </header>

      <FilterBar rows={rows} />

      {/* P1: Visible row filters — date range and symbol. Previously stored in localStorage
          (bl.filters.v4) with no UI controls, causing stale values to silently hide rows. */}
      {rawRows.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12
            }}
          >
            <h3 className="section-title" style={{ margin: 0 }}>
              Row Filters
            </h3>
            {hasActiveFilters && (
              <button
                className="btn small"
                onClick={() => {
                  setT0("");
                  setT1("");
                  setSymbolFilter("");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12
            }}
          >
            <label className="text-muted" style={{ fontSize: 12 }}>
              From
              <input
                className="input-block"
                value={t0}
                onChange={(e) => setT0(e.target.value)}
                placeholder="YYYY-MM-DD HH:MM:SS"
              />
            </label>
            <label className="text-muted" style={{ fontSize: 12 }}>
              To
              <input
                className="input-block"
                value={t1}
                onChange={(e) => setT1(e.target.value)}
                placeholder="YYYY-MM-DD HH:MM:SS"
              />
            </label>
            <label className="text-muted" style={{ fontSize: 12 }}>
              Symbol
              <input
                className="input-block"
                value={symbolFilter}
                onChange={(e) => setSymbolFilter(e.target.value)}
                placeholder="e.g. BTCUSDT"
              />
            </label>
          </div>
        </div>
      )}

      {/* P2: TypeFilter now uses hidden-set model with Show All / Hide All */}
      <TypeFilter
        types={detectedTypes}
        hidden={hiddenTypeSet}
        onChange={(next) => setHiddenTypes(Array.from(next))}
        onShowAll={() => setHiddenTypes([])}
        onHideAll={() => setHiddenTypes(detectedTypes)}
        counts={typeCounts}
      />

      <section className="space">
        <GridPasteBox onUseTSV={runParse} onError={setError} />
        {error && (
          <div className="error" style={{ marginTop: 8 }}>
            {error}
          </div>
        )}
      </section>

      <section className="kpi-row">
        <KpiStat label="Rows (total)" value={kpiTotal} />
        <KpiStat label="Rows (filtered)" value={kpiFiltered} />
        <KpiStat label="Symbols (filtered)" value={kpiSymbols} />
      </section>

      <Tabs active={tab} onChange={setTab} />

      {tab === "summary" && (
        <section className="grid-2">
          {typeOrder.map(([typeKey, totals]) => (
            <RpnTable key={typeKey} title={humanize(typeKey)} map={totals} />
          ))}
        </section>
      )}

      {tab === "symbol" && (
        <section style={{ marginTop: 12 }}>
          <SymbolTable
            rows={rows.map((r) => ({
              symbol: r.symbol,
              asset: r.asset,
              type: r.type,
              amount: r.amount
            }))}
          />
        </section>
      )}

      {tab === "swaps" && (
        <section style={{ marginTop: 12 }}>
          <SwapsEvents
            coinSwapEvents={coinSwapEvents}
            autoExchangeEvents={autoExchangeEvents}
            eventsOrdersByAsset={eventsOrdersByAsset}
            eventsPayoutsByAsset={eventsPayoutsByAsset}
          />
        </section>
      )}

      {tab === "diag" && (
        <section className="card" style={{ marginTop: 12 }}>
          <h3 className="section-title" style={{ marginBottom: 8 }}>
            Diagnostics
          </h3>
          <ul className="mono small" style={{ lineHeight: "20px", marginTop: 8 }}>
            <li>Total pasted rows: {parseMeta?.totalInputRows ?? rawRows.length}</li>
            <li>Included rows (USDⓈ-M): {rawRows.length}</li>
            <li>Excluded rows (Coin-M / out of scope): {parseMeta?.excluded.length ?? 0}</li>
            <li>Invalid rows: {parseMeta?.invalid.length ?? 0}</li>
            <li>Rows after filters: {rows.length}</li>
            <li>Unique symbols (filtered): {kpiSymbols}</li>
            <li>Types found (filtered): {Object.keys(totalsByType).length}</li>
            <li>Input format detected: {parseMeta?.inputFormat ?? "—"}</li>
            <li>Header used: {parseMeta?.headerUsed ? parseMeta.headerUsed.join(" | ") : "(none — heuristic fallback)"}</li>
          </ul>
          {parseMeta && Object.keys(parseMeta.rawTypes).length > 0 && (
            <>
              <h4 className="section-title" style={{ marginTop: 16, marginBottom: 6 }}>Raw types detected</h4>
              <ul className="mono small">
                {Object.entries(parseMeta.rawTypes).sort((a, b) => b[1] - a[1]).map(([t, n]) => (
                  <li key={t}>{t} <span style={{ opacity: 0.6 }}>× {n}</span>{parseMeta.unknownTypes.includes(t) ? " [UNKNOWN]" : ""}</li>
                ))}
              </ul>
            </>
          )}
          {parseMeta && parseMeta.warnings.length > 0 && (
            <>
              <h4 className="section-title" style={{ marginTop: 16, marginBottom: 6 }}>Warnings</h4>
              <ul className="mono small">
                {parseMeta.warnings.map((w, i) => (
                  <li key={i}>{w.rowIndex ? `row ${w.rowIndex}: ` : ""}{w.message}</li>
                ))}
              </ul>
            </>
          )}
          {parseMeta && parseMeta.excluded.length > 0 && (
            <>
              <h4 className="section-title" style={{ marginTop: 16, marginBottom: 6 }}>Excluded (not USDⓈ-M)</h4>
              <ul className="mono small" style={{ maxHeight: 240, overflow: "auto" }}>
                {parseMeta.excluded.slice(0, 200).map((r, i) => (
                  <li key={i}>row {r.rowIndex} – {r.asset} {r.type} {r.amountStr} – {r.excludeReason}</li>
                ))}
              </ul>
            </>
          )}
          {parseMeta && parseMeta.invalid.length > 0 && (
            <>
              <h4 className="section-title" style={{ marginTop: 16, marginBottom: 6 }}>Invalid</h4>
              <ul className="mono small" style={{ maxHeight: 240, overflow: "auto" }}>
                {parseMeta.invalid.slice(0, 200).map((r, i) => (
                  <li key={i}>row {r.rowIndex} – {r.reason} – <span style={{ opacity: 0.6 }}>{r.raw}</span></li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {/* P7: Suspense wrapper so the lazy StoryDrawer chunk loads on first open */}
      <Suspense fallback={null}>
        <StoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} rows={rows} t0={t0} t1={t1} />
      </Suspense>
    </div>
  );
}
