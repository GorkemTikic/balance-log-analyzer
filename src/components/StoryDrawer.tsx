// src/components/StoryDrawer.tsx
import React, { useMemo, useState } from "react";
import {
  buildAudit,
  buildSummaryRows,
  type SummaryRow,
  type Row,
  parseFinalBalancesFromAudit,
  composeNarrative
} from "@/lib/story";
import { fmtTrim, fmtFinal } from "@/lib/format";
import { TEXTS, type LocalLang, friendlyLabel } from "@/lib/i18n";
import { ChartLine, ChartBars, buildDailyNet, buildAssetNet } from "./charts/SimpleCharts";

export default function StoryDrawer({
  open, onClose, rows, t0, t1
}: { open: boolean; onClose: () => void; rows: Row[]; t0?: string; t1?: string; }) {
  const [tab, setTab] = useState<"narrative" | "audit" | "charts" | "raw">("narrative");

  // Inputs
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [baselineText, setBaselineText] = useState<string>("");
  const [trAmount, setTrAmount] = useState<string>("");
  const [trAsset, setTrAsset] = useState<string>("");
  const [lang, setLang] = useState<LocalLang>("en");

  /* ---- Parsers ---- */
  function parseUTC(s: string): number | undefined {
    const m = s.trim().match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (!m) return undefined;
    const [, Y, Mo, D, H, Mi, S] = m;
    return Date.UTC(+Y, +Mo - 1, +D, +H, +Mi, +S);
  }
  function parseBaseline(s: string): { map?: Record<string, number>; error?: string } {
    const out: Record<string, number> = {};
    const lines = s.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) return { map: undefined };

    // Accept "ASSET amount" or "amount ASSET"; amount may be decimal or scientific (e.g., 5.4e-7)
    const AMT = "(-?\\d+(?:\\.\\d+)?(?:e[+\\-]?\\d+)?)";
    const PAT1 = new RegExp(`^([A-Z0-9_]+)\\s+${AMT}$`, "i");
    const PAT2 = new RegExp(`^${AMT}\\s+([A-Z0-9_]+)$`, "i");

    for (const line of lines) {
      let m = line.match(PAT1);
      if (m) { out[m[1].toUpperCase()] = (out[m[1].toUpperCase()] || 0) + Number(m[2]); continue; }
      m = line.match(PAT2);
      if (m) { out[m[2].toUpperCase()] = (out[m[2].toUpperCase()] || 0) + Number(m[1]); continue; }
      return { error: `Could not parse: "${line}"` };
    }
    return { map: out };
  }
  function parseTransfer(amountStr: string, assetStr: string) {
    const amount = Number((amountStr || "").trim());
    const asset = (assetStr || "").trim().toUpperCase();
    if (!asset || !Number.isFinite(amount)) return undefined;
    return { asset, amount };
  }

  const baselineParsed = useMemo(() => parseBaseline(baselineText), [baselineText]);
  const transferParsed = useMemo(() => parseTransfer(trAmount, trAsset), [trAmount, trAsset]);

  const startISO = useMemo(() => {
    const ts = start ? parseUTC(start) : undefined;
    if (!ts) return undefined;
    return new Date(ts).toISOString().replace("T", " ").replace("Z", "");
  }, [start]);

  /* ---- Summary table ---- */
  const summaryRows: SummaryRow[] = useMemo(() => buildSummaryRows(rows), [rows]);

  /* ---- Agent Audit (math unchanged) ---- */
  const auditText = useMemo(() => {
    const anchorTs = start ? parseUTC(start) : undefined;
    if (!anchorTs) return "Set a Start time (UTC+0) to run the audit.";
    const endTs = end ? parseUTC(end) : undefined;
    try {
      return buildAudit(rows, { anchorTs, endTs, baseline: baselineParsed.map, anchorTransfer: transferParsed });
    } catch (e: any) {
      return "Audit failed: " + (e?.message || String(e));
    }
  }, [start, end, rows, baselineParsed.map, transferParsed]);

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
    // Not rounding here; display-time trimming handles it.
    return G;
  }, [summaryRows, lang]);

  /* ---- Final balances from Agent Audit (exact mirror) ---- */
  const finalFromAudit = useMemo(() => parseFinalBalancesFromAudit(auditText), [auditText]);

  /* ---- Narrative text ---- */
  const friendlyText = useMemo(() => composeNarrative({
    lang,
    startTs: start ? parseUTC(start) : undefined, // Pass raw TS, let story.ts handle offset/format
    baselineMap: baselineParsed.map,
    transferAtStart: transferParsed,
    groups,
    finalFromAudit,
  }), [lang, start, baselineParsed.map, transferParsed, groups, finalFromAudit]);

  /* ---- Copy & Export ---- */
  async function copyStory() {
    try { await navigator.clipboard.writeText(friendlyText); alert("Copied to clipboard."); }
    catch { alert("Copy failed (clipboard is blocked)."); }
  }
  async function exportSummaryPng() {
    try {
      const el = document.getElementById("story-summary-table");
      if (!el) throw new Error("Summary table not found");
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(el as HTMLElement, { backgroundColor: "#0f172a", scale: 2 });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url; a.download = "balance-story-summary.png"; a.click();
    } catch (err: any) {
      alert("Export failed: " + (err?.message || String(err)));
    }
  }

  /* ---- Tiny charts (unchanged) ---- */
  const dailySeries = useMemo(() => buildDailyNet(rows), [rows]);
  const assetNets = useMemo(() => buildAssetNet(rows), [rows]);

  if (!open) return null;
  const T = TEXTS[lang];

  return (
    <div aria-modal role="dialog" onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} className="card"
        style={{ width: "min(980px, 100%)", height: "100%", margin: 0, borderRadius: 0, overflow: "auto", background: "#1e293b", boxShadow: "0 10px 30px rgba(0,0,0,.5)", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>

        {/* Header */}
        <div className="section-head" style={{ position: "sticky", top: 0, background: "#1e293b", zIndex: 1, alignItems: "center", flexWrap: "wrap", gap: 8, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 className="section-title" style={{ fontSize: 20, color: "#f8fafc" }}>{T.title}</h3>
          <div className="btn-row" style={{ gap: 8, flexWrap: "wrap" }}>
            {tab === "narrative" && <button className="btn" onClick={copyStory}>{T.copyStory}</button>}
            {tab === "audit" && <button className="btn" onClick={async () => {
              try { await navigator.clipboard.writeText(auditText); alert("Copied to clipboard."); }
              catch { alert("Copy failed (clipboard is blocked)."); }
            }}>{T.copyAudit}</button>}
            <select className="btn" style={{ background: "#111827", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }} value={lang} onChange={(e) => setLang(e.target.value as LocalLang)} title={T.lang}>
              <option value="en">English (UTC+0)</option>
              <option value="tr">Türkçe (UTC+3)</option>
              <option value="es">Español (UTC+0)</option>
              <option value="pt">Português (UTC+0)</option>
              <option value="vi">Tiếng Việt (UTC+7)</option>
              <option value="ru">Русский (UTC+3)</option>
              <option value="uk">Українська (UTC+2)</option>
              <option value="ar">العربية (UTC+3)</option>
              <option value="zh">中文 (UTC+8)</option>
              <option value="ko">한국어 (UTC+9)</option>
            </select>
            <button className="btn" onClick={onClose}>{T.close}</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="card" style={{ marginTop: 8, padding: 8, background: "rgba(0,0,0,0.2)", border: "none" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => setTab("narrative")}
              style={{ background: tab === "narrative" ? "#38bdf8" : "transparent", color: tab === "narrative" ? "#0f172a" : "#94a3b8", border: "none" }}>{T.tabNarrative}</button>
            <button className="btn" onClick={() => setTab("audit")}
              style={{ background: tab === "audit" ? "#38bdf8" : "transparent", color: tab === "audit" ? "#0f172a" : "#94a3b8", border: "none" }}>{T.tabAudit}</button>
            <button className="btn" onClick={() => setTab("charts")}
              style={{ background: tab === "charts" ? "#38bdf8" : "transparent", color: tab === "charts" ? "#0f172a" : "#94a3b8", border: "none" }}>{T.tabCharts}</button>
            <button className="btn" onClick={() => setTab("raw")}
              style={{ background: tab === "raw" ? "#38bdf8" : "transparent", color: tab === "raw" ? "#0f172a" : "#94a3b8", border: "none" }}>{T.tabRaw}</button>
          </div>
        </div>

        {/* Narrative */}
        {tab === "narrative" && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, alignItems: "start" }}>
              <label className="muted" style={{ minWidth: 0 }}>
                {T.startTime}
                <input className="btn" style={inputStyle} value={start} onChange={(e) => setStart(e.target.value)} placeholder="YYYY-MM-DD HH:MM:SS" />
              </label>
              <label className="muted" style={{ minWidth: 0 }}>
                {T.baseline}
                <textarea className="btn" style={{ ...inputStyle, minHeight: 64, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: 13 }}
                  placeholder={`One per line:\nUSDT 3450.12345678\n0.015 BTC`} value={baselineText} onChange={(e) => setBaselineText(e.target.value)} />
              </label>
              <div style={{ minWidth: 0 }}>
                <div className="muted">{T.transferAtStart}</div>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(140px,1fr) minmax(110px,1fr)", gap: 8, marginTop: 6 }}>
                  <input className="btn" style={inputStyle} placeholder={T.amount} value={trAmount} onChange={(e) => setTrAmount(e.target.value)} />
                  <input className="btn" style={inputStyle} placeholder={T.asset} value={trAsset} onChange={(e) => setTrAsset(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <h4 className="section-title" style={{ marginBottom: 12 }}>{T.narrative}</h4>
              <pre className="mono" style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: "24px", background: "rgba(0,0,0,0.3)", color: "#e2e8f0", padding: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                {friendlyText}
              </pre>
            </div>

            {/* Summary table */}
            <div className="card" style={{ marginTop: 16 }}>
              <div className="section-head" style={{ alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <h4 className="section-title">{T.summaryByTypeAsset}</h4>
                <div className="btn-row"><button className="btn" onClick={exportSummaryPng}>{T.exportPng}</button></div>
              </div>
              <div id="story-summary-table" style={{ overflow: "auto", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}>
                <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", minWidth: 760 }}>
                  <thead style={{ background: "rgba(0,0,0,0.4)" }}>
                    <tr>
                      <th style={thStyleLeft}>Type</th>
                      <th style={thStyle}>Asset</th>
                      <th style={thStyle}>{TEXTS[lang]["in"]}</th>
                      <th style={thStyle}>{TEXTS[lang].out}</th>
                      <th style={thStyleRight}>{TEXTS[lang].net}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryRows.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: "12px 14px", textAlign: "center", color: "#94a3b8" }}>{T.noData}</td></tr>
                    )}
                    {summaryRows.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 ? "transparent" : "rgba(255,255,255,0.03)" }}>
                        <td style={tdStyleLeft}>{friendlyLabel(r.label, lang)}</td>
                        <td style={tdStyleMono}><span style={{ marginRight: 6 }}>{assetIcon(r.asset)}</span>{r.asset}</td>
                        <td style={{ ...tdStyleMono, color: r.in !== 0 ? "#10b981" : "#64748b" }}>{r.in !== 0 ? `+${fmtTrim(r.in)}` : "—"}</td>
                        <td style={{ ...tdStyleMono, color: r.out !== 0 ? "#ef4444" : "#64748b" }}>{r.out !== 0 ? `-${fmtTrim(r.out)}` : "—"}</td>
                        <td style={{ ...tdStyleMonoBold, color: r.net === 0 ? "#64748b" : (r.net > 0 ? "#10b981" : "#ef4444") }}>
                          {r.net === 0 ? "0" : `${r.net > 0 ? "+" : ""}${fmtTrim(r.net)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Agent Audit */}
        {tab === "audit" && (
          <div style={{ marginTop: 16 }}>
            <h4 className="section-title" style={{ marginBottom: 12 }}>{T.agentAudit}</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 16, alignItems: "start" }}>
              <label className="muted" style={{ minWidth: 0 }}>
                {T.startTime}
                <input className="btn" style={inputStyle} value={start} onChange={(e) => setStart(e.target.value)} placeholder="YYYY-MM-DD HH:MM:SS" />
              </label>
              <label className="muted" style={{ minWidth: 0 }}>
                {T.endTime}
                <input className="btn" style={inputStyle} value={end} onChange={(e) => setEnd(e.target.value)} placeholder="YYYY-MM-DD HH:MM:SS" />
              </label>
            </div>

            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <label className="muted" style={{ minWidth: 0 }}>
                {T.baseline}
                <textarea className="btn" style={{ ...inputStyle, minHeight: 120, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: 13 }}
                  placeholder={`One per line:\nUSDT 3450.12345678\n0.015 BTC`} value={baselineText} onChange={(e) => setBaselineText(e.target.value)} />
              </label>
              <div style={{ minWidth: 0 }}>
                <div className="muted">{T.transferAtStart}</div>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(140px,1fr) minmax(110px,1fr)", gap: 8, marginTop: 6 }}>
                  <input className="btn" style={inputStyle} placeholder={T.amount} value={trAmount} onChange={(e) => setTrAmount(e.target.value)} />
                  <input className="btn" style={inputStyle} placeholder={T.asset} value={trAsset} onChange={(e) => setTrAsset(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <h4 className="section-title" style={{ marginBottom: 8 }}>{T.preview}</h4>
              <pre className="mono" style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: "20px", background: "rgba(0,0,0,0.3)", color: "#e2e8f0", padding: 12, borderRadius: 8, maxHeight: 480, overflow: "auto" }}>
                {auditText}
              </pre>
            </div>
          </div>
        )}

        {/* Charts */}
        {tab === "charts" && (
          <div style={{ marginTop: 16 }}>
            <h4 className="section-title" style={{ marginBottom: 8 }}>{T.tabCharts}</h4>
            <div className="card" style={{ marginTop: 8 }}>
              <div className="section-head" style={{ alignItems: "center" }}>
                <h4 className="section-title">{T.dailyNetAll}</h4>
              </div>
              <ChartLine data={dailySeries} height={240} />
            </div>
            <div className="card" style={{ marginTop: 16 }}>
              <div className="section-head" style={{ alignItems: "center" }}>
                <h4 className="section-title">{T.netByAsset}</h4>
              </div>
              <ChartBars data={assetNets} height={280} />
            </div>
          </div>
        )}

        {/* Raw */}
        {tab === "raw" && (
          <div className="card" style={{ marginTop: 16 }}>
            <h4 className="section-title" style={{ marginBottom: 8 }}>Raw</h4>
            <pre className="mono" style={{ whiteSpace: "pre-wrap", fontSize: 12, lineHeight: "18px", background: "rgba(0,0,0,0.3)", color: "#e2e8f0", padding: 12, borderRadius: 8, maxHeight: 560, overflow: "auto" }}>
              {rawPreview}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}

/* ---------------- Raw tab note ---------------- */
const rawPreview = "Diagnostics tab shows internal totals. Use Agent Audit for balance math and Narrative for user-facing text.";

/* ---------------- Styles ---------------- */
const cellBase: React.CSSProperties = { padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.05)", verticalAlign: "top", fontSize: 13 };
const thBase: React.CSSProperties = { ...cellBase, fontWeight: 600, color: "#94a3b8", borderTop: "none", textAlign: "left" };
const tdBase: React.CSSProperties = { ...cellBase, color: "#f8fafc" };
const thStyleLeft: React.CSSProperties = { ...thBase, borderTopLeftRadius: 8 };
const thStyle: React.CSSProperties = { ...thBase };
const thStyleRight: React.CSSProperties = { ...thBase, borderTopRightRadius: 8 };
const tdStyleLeft: React.CSSProperties = { ...tdBase, fontWeight: 500 };
const tdStyleMono: React.CSSProperties = { ...tdBase, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const tdStyleMonoBold: React.CSSProperties = { ...tdStyleMono, fontWeight: 700 };
const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", textAlign: "left", marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

/* ---------------- Icons ---------------- */
function assetIcon(asset: string) {
  const a = asset.toUpperCase();
  if (a === "BTC") return "🟧";
  if (a === "ETH") return "⚪";
  if (a === "BNB") return "🟡";
  if (a === "USDT") return "🟩";
  if (a === "USDC") return "🔵";
  if (a === "BFUSD") return "🟦";
  if (a === "FDUSD") return "🟪";
  if (a === "LDUSDT") return "🟩";
  if (a === "BNFCR") return "🟠";
  return "◼️";
}
