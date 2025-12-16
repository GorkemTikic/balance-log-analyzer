import React, { useMemo } from "react";
import { type StoryTabProps } from "./types";
import { TEXTS } from "@/lib/i18n";
import { buildAudit, parseUTC, parseBaseline, parseTransfer } from "@/lib/story";

export default function StoryAudit({ rows, lang, inputs, setters }: StoryTabProps) {
  const T = TEXTS[lang];
  const { start, end, baselineText, trAmount, trAsset } = inputs;
  const { setStart, setEnd, setBaselineText, setTrAmount, setTrAsset } = setters;

  const baselineParsed = useMemo(() => parseBaseline(baselineText), [baselineText]);
  const transferParsed = useMemo(() => parseTransfer(trAmount, trAsset), [trAmount, trAsset]);

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

  async function copyAudit() {
    try {
      await navigator.clipboard.writeText(auditText);
      alert("Copied.");
    } catch {
      alert("Copy failed.");
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
            placeholder={`One per line:\nUSDT 1000`}
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
        </div>
      </div>

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
