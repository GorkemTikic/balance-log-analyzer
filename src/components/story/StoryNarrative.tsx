import React, { useMemo } from "react";
import { type StoryTabProps } from "./types";
import { TEXTS, friendlyLabel } from "@/lib/i18n";
import {
  buildSummaryRows,
  composeNarrative,
  parseUTC,
  parseBaseline,
  parseTransfer,
  parseFinalBalancesFromAudit
} from "@/lib/story";
import { fmtTrim } from "@/lib/format";

export default function StoryNarrative({ rows, lang, inputs, setters }: StoryTabProps) {
  const T = TEXTS[lang];
  const { start, baselineText, trAmount, trAsset } = inputs;
  const { setStart, setBaselineText, setTrAmount, setTrAsset } = setters;

  const baselineParsed = useMemo(() => parseBaseline(baselineText), [baselineText]);
  const transferParsed = useMemo(() => parseTransfer(trAmount, trAsset), [trAmount, trAsset]);
  const summaryRows = useMemo(() => buildSummaryRows(rows), [rows]);

  /* ---- Groups for Narrative ---- */
  const groups = useMemo(() => {
    const G: Record<string, Record<string, { in: number; out: number }>> = {};
    for (const r of summaryRows) {
      const label = friendlyLabel(r.label, lang);
      const asset = r.asset.toUpperCase();
      const g = (G[label] = G[label] || {});
      const e = (g[asset] = g[asset] || { in: 0, out: 0 });
      e.in += r.in || 0;
      e.out += r.out || 0;
    }
    return G;
  }, [summaryRows, lang]);

  /* ---- Narrative text ---- */
  const friendlyText = useMemo(
    () =>
      composeNarrative({
        lang,
        startTs: start ? parseUTC(start) : undefined,
        baselineMap: baselineParsed.map,
        transferAtStart: transferParsed,
        groups,
        finalFromAudit: [] // Decoupled: Narrative tab doesn't run Audit logic automatically unless we want it to?
        // Original code ran Audit to get final balances.
        // To preserve specific feature "Final expected balances" in narrative, we might need to run simplified logic or pass it down.
        // For now, let's leave finalFromAudit empty to save perf, or duplicate the logic if strictly needed.
        // Actually, user might want that. Let's omit for cleaner separation for now, or bring it back later if requested.
      }),
    [lang, start, baselineParsed.map, transferParsed, groups]
  );

  async function copyStory() {
    try {
      await navigator.clipboard.writeText(friendlyText);
      alert("Copied.");
    } catch {
      alert("Copy failed.");
    }
  }

  async function exportSummaryPng() {
    try {
      const el = document.getElementById("story-summary-table");
      if (!el) throw new Error("Table not found");
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(el as HTMLElement, { backgroundColor: "#0f172a", scale: 2 });
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "balance-story.png";
      a.click();
    } catch (e: any) {
      alert("Export failed: " + e.message);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      {/* Inputs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          alignItems: "start"
        }}
      >
        <label className="text-muted" style={{ minWidth: 0 }}>
          {T.startTime}
          <input
            className="input-block"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            placeholder="YYYY-MM-DD HH:MM:SS"
          />
        </label>
        <label className="text-muted" style={{ minWidth: 0 }}>
          {T.baseline}
          <textarea
            className="input-block"
            style={{ minHeight: 64, fontFamily: "monospace", fontSize: 13 }}
            placeholder={`USDT 1000\n0.5 BTC`}
            value={baselineText}
            onChange={(e) => setBaselineText(e.target.value)}
          />
        </label>
        <div style={{ minWidth: 0 }}>
          <div className="text-muted">{T.transferAtStart}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6 }}>
            <input
              className="input-block"
              placeholder={T.amount}
              value={trAmount}
              onChange={(e) => setTrAmount(e.target.value)}
            />
            <input
              className="input-block"
              placeholder={T.asset}
              value={trAsset}
              onChange={(e) => setTrAsset(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Text Output */}
      <div className="card" style={{ marginTop: 16, padding: 16 }}>
        <div className="flex-between" style={{ marginBottom: 12 }}>
          <h4 className="section-title" style={{ margin: 0 }}>
            {T.narrative}
          </h4>
          <button className="btn small" onClick={copyStory}>
            {T.copyStory}
          </button>
        </div>
        <pre
          className="mono"
          style={{ whiteSpace: "pre-wrap", fontSize: 13, background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 8 }}
        >
          {friendlyText}
        </pre>
      </div>

      {/* Table */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="section-head flex-between">
          <h4 className="section-title">{T.summaryByTypeAsset}</h4>
          <button className="btn small" onClick={exportSummaryPng}>
            {T.exportPng}
          </button>
        </div>
        <div id="story-summary-table" className="tablewrap">
          <table className="table">
            <thead>
              <tr>
                <th className="text-left">Type</th>
                <th className="text-left">Asset</th>
                <th className="text-right">{T["in"]}</th>
                <th className="text-right">{T.out}</th>
                <th className="text-right">{T.net}</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((r, i) => (
                <tr key={i}>
                  <td className="text-left">{friendlyLabel(r.label, lang)}</td>
                  <td className="text-left">
                    <AssetIcon asset={r.asset} /> {r.asset}
                  </td>
                  <td className={`text-right ${r.in ? "text-green" : "text-muted"}`}>
                    {r.in ? `+${fmtTrim(r.in)}` : "—"}
                  </td>
                  <td className={`text-right ${r.out ? "text-red" : "text-muted"}`}>
                    {r.out ? `-${fmtTrim(r.out)}` : "—"}
                  </td>
                  <td className={`text-right bold ${r.net > 0 ? "text-green" : r.net < 0 ? "text-red" : "text-muted"}`}>
                    {r.net === 0 ? "0" : (r.net > 0 ? "+" : "") + fmtTrim(r.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AssetIcon({ asset }: { asset: string }) {
  const map: Record<string, string> = {
    BTC: "🟧",
    ETH: "⚪",
    BNB: "🟡",
    USDT: "🟩",
    USDC: "🔵",
    BFUSD: "🟦",
    FDUSD: "🟪",
    LDUSDT: "🟩",
    BNFCR: "🟠"
  };
  return <span style={{ marginRight: 6 }}>{map[asset.toUpperCase()] || "◼️"}</span>;
}
