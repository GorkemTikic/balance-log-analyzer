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
  open,
  onClose,
  rows,
  t0,
  t1
}: {
  open: boolean;
  onClose: () => void;
  rows: Row[];
  t0?: string;
  t1?: string;
}) {
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
    <div
      aria-modal
      role="dialog"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "flex-end"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          width: "min(980px, 100%)",
          height: "100%",
          margin: 0,
          borderRadius: 0,
          overflow: "auto",
          background: "#1e293b",
          boxShadow: "0 10px 30px rgba(0,0,0,.5)",
          borderLeft: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        {/* Premium Header */}
        <div className="drawer-header">
          <h3 className="drawer-title">{T.title}</h3>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Language Selector */}
            <select
              className="select-premium"
              value={lang}
              onChange={(e) => setLang(e.target.value as LocalLang)}
              title={T.lang}
            >
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

            {/* Close Button (X icon) */}
            <button className="btn-icon-close" onClick={onClose} title={T.close}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs - Segmented Control Style */}
        <div style={{ padding: "16px 24px 0" }}>
          <div className="tabs-segmented">
            <TabBtn id="narrative" label={T.tabNarrative} current={tab} set={setTab} />
            <TabBtn id="audit" label={T.tabAudit} current={tab} set={setTab} />
            <TabBtn id="charts" label={T.tabCharts} current={tab} set={setTab} />
            <TabBtn id="raw" label={T.tabRaw} current={tab} set={setTab} />
          </div>
        </div>

        {/* Content Container (Scrollable part) */}
        <div style={{ padding: "24px" }}>
          {tab === "narrative" && <StoryNarrative {...props} />}
          {tab === "audit" && <StoryAudit {...props} />}
          {tab === "charts" && <StoryCharts {...props} />}
          {tab === "raw" && <StoryRaw {...props} />}
        </div>
      </div>
    </div>
  );
}

function TabBtn({ id, label, current, set }: { id: any; label: string; current: string; set: (v: any) => void }) {
  const active = current === id;
  // Use 'accent-blue' class for the active tab to trigger the blue styling
  const className = `tab-segment ${active ? "active accent-blue" : ""}`;
  return (
    <button className={className} onClick={() => set(id)}>
      {label}
    </button>
  );
}
