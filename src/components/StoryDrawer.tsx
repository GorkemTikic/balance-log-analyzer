// src/components/StoryDrawer.tsx
import React, { useState } from "react";
import { type Row } from "@/lib/story";
import { TEXTS, type LocalLang } from "@/lib/i18n";

import StoryNarrative from "./story/StoryNarrative";
import StoryAudit from "./story/StoryAudit";
import StoryCharts from "./story/StoryCharts";
import StoryRaw from "./story/StoryRaw";
import { type StoryInputState } from "./story/types";

export default function StoryDrawer({
  open, onClose, rows, t0, t1
}: { open: boolean; onClose: () => void; rows: Row[]; t0?: string; t1?: string; }) {
  const [tab, setTab] = useState<"narrative" | "audit" | "charts" | "raw">("narrative");

  // Shared Inputs (persistent across tabs)
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [baselineText, setBaselineText] = useState<string>("");
  const [trAmount, setTrAmount] = useState<string>("");
  const [trAsset, setTrAsset] = useState<string>("");
  const [lang, setLang] = useState<LocalLang>("en");

  if (!open) return null;
  const T = TEXTS[lang];

  const inputState: StoryInputState = { start, end, baselineText, trAmount, trAsset };
  const setters = { setStart, setEnd, setBaselineText, setTrAmount, setTrAsset };
  const props = { rows, lang, inputs: inputState, setters };

  return (
    <div aria-modal role="dialog" onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} className="card"
        style={{ width: "min(980px, 100%)", height: "100%", margin: 0, borderRadius: 0, overflow: "auto", background: "#1e293b", boxShadow: "0 10px 30px rgba(0,0,0,.5)", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>

        {/* Header */}
        <div className="section-head sticky-top" style={{ flexWrap: "wrap", gap: 8, paddingBottom: 16 }}>
          <h3 className="section-title" style={{ fontSize: 20, color: "#f8fafc" }}>{T.title}</h3>
          <div className="btn-row" style={{ gap: 8, flexWrap: "wrap" }}>
            <select className="btn" style={{ background: "#111827", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }} value={lang} onChange={(e) => setLang(e.target.value as LocalLang)} title={T.lang}>
              <option value="en">English (UTC+0)</option>
              {/* <option value="tr">Türkçe (UTC+3)</option> ... can add back if needed, keep simplified for now or copy full list */}
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
            <TabBtn id="narrative" label={T.tabNarrative} current={tab} set={setTab} />
            <TabBtn id="audit" label={T.tabAudit} current={tab} set={setTab} />
            <TabBtn id="charts" label={T.tabCharts} current={tab} set={setTab} />
            <TabBtn id="raw" label={T.tabRaw} current={tab} set={setTab} />
          </div>
        </div>

        {/* Content */}
        {tab === "narrative" && <StoryNarrative {...props} />}
        {tab === "audit" && <StoryAudit {...props} />}
        {tab === "charts" && <StoryCharts {...props} />}
        {tab === "raw" && <StoryRaw {...props} />}

      </div>
    </div>
  );
}

function TabBtn({ id, label, current, set }: { id: any; label: string; current: string; set: (v: any) => void }) {
  const active = current === id;
  return (
    <button className="btn" onClick={() => set(id)}
      style={{ background: active ? "#38bdf8" : "transparent", color: active ? "#0f172a" : "#94a3b8", border: "none" }}>
      {label}
    </button>
  );
}

