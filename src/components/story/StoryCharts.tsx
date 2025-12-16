import React, { useMemo } from "react";
import { type StoryTabProps } from "./types";
import { TEXTS } from "@/lib/i18n";
import { ChartLine, ChartBars, buildDailyNet, buildAssetNet } from "@/components/charts/SimpleCharts";

export default function StoryCharts({ rows, lang }: StoryTabProps) {
  const T = TEXTS[lang];
  const dailySeries = useMemo(() => buildDailyNet(rows), [rows]);
  const assetNets = useMemo(() => buildAssetNet(rows), [rows]);

  return (
    <div style={{ marginTop: 16 }}>
      <h4 className="section-title" style={{ marginBottom: 8 }}>
        {T.tabCharts}
      </h4>
      <div className="card" style={{ marginTop: 8 }}>
        <div className="section-head">
          <h4 className="section-title">{T.dailyNetAll}</h4>
        </div>
        <ChartLine data={dailySeries} height={240} />
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="section-head">
          <h4 className="section-title">{T.netByAsset}</h4>
        </div>
        <ChartBars data={assetNets} height={280} />
      </div>
    </div>
  );
}
