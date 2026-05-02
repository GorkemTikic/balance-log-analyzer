import React, { useMemo, useState } from "react";
import Amount from "@/components/Amount";
import { type StoryTabProps } from "./types";
import { TEXTS } from "@/lib/i18n";
import { buildAudit, parseUTC, parseBaseline, parseTransfer } from "@/lib/story";
import { reconcileUsdMFuturesBalance, type ParsedRow } from "@/lib/balanceLog";

export default function StoryAudit({ rows, lang, inputs, setters }: StoryTabProps) {
  const T = TEXTS[lang];
  const { start, end, baselineText, trAmount, trAsset } = inputs;
  const { setStart, setEnd, setBaselineText, setTrAmount, setTrAsset } = setters;
  const [walletText, setWalletText] = useState<string>("");

  const baselineParsed = useMemo(() => parseBaseline(baselineText), [baselineText]);
  const transferParsed = useMemo(() => parseTransfer(trAmount, trAsset), [trAmount, trAsset]);
  const walletParsed = useMemo(() => parseBaseline(walletText), [walletText]);

  const auditText = useMemo(() => {
    const anchorTs = start ? parseUTC(start) : undefined;
    if (!anchorTs) return T.auditStartRequired;
    const endTs = end ? parseUTC(end) : undefined;
    try {
      return buildAudit(rows, { anchorTs, endTs, baseline: baselineParsed.map, anchorTransfer: transferParsed });
    } catch (e: any) {
      return `${T.auditFailed}: ${e?.message || String(e)}`;
    }
  }, [T, start, end, rows, baselineParsed.map, transferParsed]);

  const reconcile = useMemo(() => {
    const anchorTs = start ? parseUTC(start) : undefined;
    if (!anchorTs) return null;
    const endTs = end ? parseUTC(end) : undefined;
    const adapted: ParsedRow[] = rows.map((r, i) => ({
      rowIndex: i + 1,
      id: r.id,
      uid: r.uid,
      asset: r.asset,
      type: r.type,
      amountStr: r.amountStr ?? String(r.amount),
      amount: r.amount,
      time: r.time,
      ts: r.ts,
      symbol: r.symbol,
      extra: r.extra,
      raw: r.raw,
      category: "OTHER",
      scope: "USDM"
    }));
    return reconcileUsdMFuturesBalance({
      rows: adapted,
      startTs: anchorTs,
      endTs,
      baseline: baselineParsed.map,
      transferAtStart: transferParsed,
      currentWallet: walletParsed.map
    });
  }, [start, end, rows, baselineParsed.map, transferParsed, walletParsed.map]);

  async function copyAudit() {
    try {
      await navigator.clipboard.writeText(auditText);
      alert(T.copied);
    } catch {
      alert(T.copyFailed);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div className="flex-between" style={{ marginBottom: 12 }}>
        <h4 className="section-title" style={{ margin: 0 }}>
          {T.agentAudit}
        </h4>
        <button className="btn small" onClick={copyAudit}>
          {T.copyAudit}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
          gap: 16,
          alignItems: "start"
        }}
      >
        <label className="text-muted">
          {T.startTime}
          <input
            className="input-block"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            placeholder="YYYY-MM-DD HH:MM:SS"
          />
        </label>
        <label className="text-muted">
          {T.endTime}
          <input
            className="input-block"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            placeholder="YYYY-MM-DD HH:MM:SS"
          />
        </label>
      </div>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <label className="text-muted">
          {T.baseline}
          <textarea
            className="input-block"
            style={{ minHeight: 120, fontFamily: "monospace", fontSize: 13 }}
            placeholder={`${T.onePerLine}\nUSDT 1000`}
            value={baselineText}
            onChange={(e) => setBaselineText(e.target.value)}
          />
        </label>
        <div>
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
          <div className="text-muted" style={{ marginTop: 12 }}>
            {T.currentWallet}
          </div>
          <textarea
            className="input-block"
            style={{ minHeight: 80, fontFamily: "monospace", fontSize: 13, marginTop: 6 }}
            placeholder="USDT 1234.56\nBNB 0.0123"
            value={walletText}
            onChange={(e) => setWalletText(e.target.value)}
          />
        </div>
      </div>

      {reconcile && Object.keys(reconcile.perAsset).length > 0 && (
        <div className="card" style={{ marginTop: 16, padding: 12 }}>
          <h4 className="section-title" style={{ marginBottom: 8 }}>
            {T.reconciliationTitle} ({reconcile.consideredRowCount} {T.rowsInRange})
          </h4>
          {reconcile.warnings.length > 0 && (
            <ul className="mono small" style={{ color: "#f59e0b", marginBottom: 8 }}>
              {reconcile.warnings.map((w, i) => (
                <li key={i}>{w.message}</li>
              ))}
            </ul>
          )}
          <div style={{ overflowX: "auto" }}>
            <table className="table mono small" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>{T.asset}</th>
                  <th>{T.baselineColumn}</th>
                  <th>{T.transferColumn}</th>
                  <th>{T.activityColumn}</th>
                  <th>{T.expectedColumn}</th>
                  <th>{T.actualColumn}</th>
                  <th>{T.differenceColumn}</th>
                  <th>{T.statusColumn}</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(reconcile.perAsset)
                  .sort((a, b) => a.asset.localeCompare(b.asset))
                  .map((r) => (
                    <tr key={r.asset}>
                      <td>{r.asset}</td>
                      <td style={amountCellStyle}>
                        <Amount value={r.baseline} />
                      </td>
                      <td style={amountCellStyle}>
                        <Amount value={r.transferAtStart} />
                      </td>
                      <td style={amountCellStyle}>
                        <Amount value={r.activity} showPlus />
                      </td>
                      <td style={amountCellStyle}>
                        <Amount value={r.expected} bold />
                      </td>
                      <td style={amountCellStyle}>
                        <Amount value={r.actual} />
                      </td>
                      <td style={amountCellStyle}>
                        <Amount value={r.difference} showPlus />
                      </td>
                      <td
                        style={{
                          color:
                            r.status === "match" ? "#10b981" : r.status === "mismatch" ? "#ef4444" : "#94a3b8"
                        }}
                      >
                        {r.status === "match" ? T.match : r.status === "mismatch" ? T.mismatch : T.unknown}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 16, padding: 12 }}>
        <h4 className="section-title" style={{ marginBottom: 8 }}>
          {T.preview}
        </h4>
        <pre
          className="mono"
          style={{
            whiteSpace: "pre-wrap",
            fontSize: 13,
            background: "rgba(0,0,0,0.3)",
            padding: 12,
            borderRadius: 8,
            maxHeight: 480,
            overflow: "auto"
          }}
        >
          {auditText}
        </pre>
      </div>
    </div>
  );
}

const amountCellStyle: React.CSSProperties = {
  whiteSpace: "nowrap",
  fontVariantNumeric: "tabular-nums",
  wordBreak: "normal"
};
