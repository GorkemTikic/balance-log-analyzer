// src/lib/story.ts
// Pure utilities for narrative/audit/summary. No React imports here.
import { type LocalLang, TEXTS, friendlyLabel, LANG_CONFIG } from "./i18n";

export type Row = {
  id: string; uid: string; asset: string; type: string; amount: number;
  time: string; ts: number; symbol: string; extra: string; raw: string;
};

export type SummaryRow = { label: string; asset: string; in: number; out: number; net: number };

// ---------------- Formatting ----------------
import { fmt, fmtTrim, fmtFinal, fmtSigned as fmtSignedPlus } from "./format";
import { nonZero } from "./format"; // Wait, I didn't add nonZero to format.ts yet.

// Let's add nonZero to format.ts in next step or now? 
// Actually I can just inline it or add it to format.ts. 
// Ideally I should update format.ts to include nonZero first.


/* Template: "Hello {NAME}" */
function tFormat(s: string, map: Record<string, string>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => (map[k] ?? ""));
}

/* -------- Date Formatting (No milliseconds, with Offset) -------- */
export function formatTime(ts: number, offsetHours: number): string {
  // Create date object from timestamp
  const date = new Date(ts);
  // Adjust for offset (UTC timestamp + offset hours)
  // We want to force the display of the resulting "local" time as if it were UTC numbers
  // So we add the offset to the UTC milliseconds
  const adjusted = new Date(date.getTime() + offsetHours * 3600 * 1000);

  const Y = adjusted.getUTCFullYear();
  const M = String(adjusted.getUTCMonth() + 1).padStart(2, "0");
  const D = String(adjusted.getUTCDate()).padStart(2, "0");
  const h = String(adjusted.getUTCHours()).padStart(2, "0");
  const m = String(adjusted.getUTCMinutes()).padStart(2, "0");
  const s = String(adjusted.getUTCSeconds()).padStart(2, "0");

  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

// TYPE keys possibly present in logs (extendable)
export const TYPE = {
  TRANSFER: "TRANSFER",
  REALIZED_PNL: "REALIZED_PNL",
  FUNDING_FEE: "FUNDING_FEE",
  COMMISSION: "COMMISSION",
  INSURANCE_CLEAR: "INSURANCE_CLEAR",
  WELCOME_BONUS: "WELCOME_BONUS",
  REFERRAL_KICKBACK: "REFERRAL_KICKBACK",
  COMISSION_REBATE: "COMISSION_REBATE",
  CASH_COUPON: "CASH_COUPON",
  COIN_SWAP_DEPOSIT: "COIN_SWAP_DEPOSIT",
  COIN_SWAP_WITHDRAW: "COIN_SWAP_WITHDRAW",
  POSITION_LIMIT_INCREASE_FEE: "POSITION_LIMIT_INCREASE_FEE",
  POSITION_CLAIM_TRANSFER: "POSITION_CLAIM_TRANSFER",
  AUTO_EXCHANGE: "AUTO_EXCHANGE",
  DELIVERED_SETTELMENT: "DELIVERED_SETTELMENT",
  STRATEGY_UMFUTURES_TRANSFER: "STRATEGY_UMFUTURES_TRANSFER",
  FUTURES_PRESENT: "FUTURES_PRESENT",
  EVENT_CONTRACTS_ORDER: "EVENT_CONTRACTS_ORDER",
  EVENT_CONTRACTS_PAYOUT: "EVENT_CONTRACTS_PAYOUT",
  INTERNAL_COMMISSION: "INTERNAL_COMMISSION",
  INTERNAL_TRANSFER: "INTERNAL_TRANSFER",
  BFUSD_REWARD: "BFUSD_REWARD",
  INTERNAL_AGENT_REWARD: "INTERNAL_AGENT_REWARD",
  API_REBATE: "API_REBATE",
  CONTEST_REWARD: "CONTEST_REWARD",
  INTERNAL_CONTEST_REWARD: "INTERNAL_CONTEST_REWARD",
  CROSS_COLLATERAL_TRANSFER: "CROSS_COLLATERAL_TRANSFER",
  OPTIONS_PREMIUM_FEE: "OPTIONS_PREMIUM_FEE",
  OPTIONS_SETTLE_PROFIT: "OPTIONS_SETTLE_PROFIT",
  LIEN_CLAIM: "LIEN_CLAIM",
  INTERNAL_COMMISSION_REBATE: "INTERNAL_COMMISSION_REBATE",
  FEE_RETURN: "FEE_RETURN",
  FUTURES_PRESENT_SPONSOR_REFUND: "FUTURES_PRESENT_SPONSOR_REFUND",
} as const;

type Totals = Record<string, { pos: number; neg: number; net: number }>;
export function totalsByType(rows: Row[]) {
  const map: Record<string, Totals> = {};
  for (const r of rows) {
    const tt = (map[r.type] = map[r.type] || {});
    const m = (tt[r.asset] = tt[r.asset] || { pos: 0, neg: 0, net: 0 });
    if (r.amount >= 0) m.pos += r.amount; else m.neg += Math.abs(r.amount);
    m.net += r.amount;
  }
  return map;
}

/* -------- Parse final balances from Agent Audit (keeps math intact) -------- */
export function parseFinalBalancesFromAudit(audit: string): { asset: string; amount: number }[] {
  const lines = audit.split(/\r?\n/);
  const startIdx = lines.findIndex(l => l.trim().toLowerCase().startsWith("final expected balances"));
  if (startIdx === -1) return [];
  const out: { asset: string; amount: number }[] = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const m = lines[i].match(/•\s*([A-Z0-9_]+)\s+(-?\d+(?:\.\d+)?(?:e[+\-]?\d+)?)/i);
    if (!m) continue;
    out.push({ asset: m[1].toUpperCase(), amount: Number(m[2]) });
  }
  return out;
}

/* -------- Narrative composer (display only; no math changes) -------- */
export function composeNarrative(opts: {
  lang: LocalLang;
  // We pass raw timestamp for start, not string, so we can format it with offset
  startTs?: number;
  baselineMap?: Record<string, number> | undefined;
  transferAtStart?: { asset: string; amount: number } | undefined;
  groups: Record<string, Record<string, { in: number; out: number }>>;
  finalFromAudit: { asset: string; amount: number }[];
}) {
  const { lang, startTs, baselineMap, transferAtStart, groups, finalFromAudit } = opts;
  const T = TEXTS[lang];
  const conf = LANG_CONFIG[lang] || LANG_CONFIG["en"];
  const lines: string[] = [];

  // Header
  lines.push(tFormat(T.timesNote, { ZONE: conf.label }));
  lines.push("");

  // Initial balances line (varsa tüm varlıkları listele)
  if (baselineMap && Object.keys(baselineMap).length) {
    const items = Object.keys(baselineMap).sort().map(a => `${a} ${fmtTrim(baselineMap[a])}`);
    lines.push(`${T.initialBalancesIntro} ${items.join("  •  ")}`);
  }

  // Start line
  const startStr = startTs ? formatTime(startTs, conf.offset) : "";

  if (startStr && transferAtStart) {
    const pretty = `${startStr} ${conf.label}`;
    const amtStr = fmtTrim(transferAtStart.amount);
    const before = baselineMap?.[transferAtStart.asset];
    const after = typeof before === "number" ? before + transferAtStart.amount : undefined;
    const transferLine = transferAtStart.amount >= 0
      ? tFormat(T.transferSentenceTo, { AMOUNT: amtStr, ASSET: transferAtStart.asset })
      : tFormat(T.transferSentenceFrom, { AMOUNT: amtStr, ASSET: transferAtStart.asset });
    let line = `${pretty} - ${transferLine}`;
    if (typeof before === "number" && typeof after === "number") {
      line += " " + tFormat(T.changedFromTo, {
        BEFORE: fmtTrim(before), AFTER: fmtTrim(after), ASSET: transferAtStart.asset,
      });
    } else {
      line += " " + T.balanceChanged;
    }
    lines.push("");
    lines.push(line);
  } else if (startStr) {
    lines.push("");
    lines.push(`${startStr} ${conf.label} - ${T.startLineNoTransfer}`);
  }
  lines.push("");

  // Sorting order hint
  // We map the friendly names to a priority index if possible, but simplest is to sort by keys
  // but "groups" keys are already localized friendly labels from StoryDrawer? 
  // Wait, StoryDrawer calls `friendlyLabel(r.label, lang)` BEFORE creating the `groups` object.
  // So `groups` keys ARE the friendly strings.
  // We will just sort them alphabetically or by a known order if we can matching them back.
  // Since they are already localized, robust sorting is hard without reverse lookup. 
  // We'll trust standard sort or the order in `groups` iteration if we want.
  // But let's try to maintain a "logical" order if possible. 
  // For now, alphabetical on friendly label is acceptable fallback.
  const groupNames = Object.keys(groups).sort();

  lines.push(T.afterStart);
  lines.push("");

  // Groups
  for (const g of groupNames) {
    const byAsset = groups[g];
    // Check if it is swap or funding based on Friendly Label content?
    // This is tricky because `g` is localized.
    // However, `friendlyLabel` returns `T.COIN_SWAP_MIX` etc.
    // So we can compare `g` against `T.COIN_SWAP_MIX`.

    // Using `as any` because TS doesn't know specific keys on T usually, but we know T is one of TEXTS_*
    const T_any = T as any;
    const isSwap = (g === T_any.COIN_SWAP_MIX || g === T_any.AUTO_EXCHANGE_MIX);
    const isFunding = (g === T_any.FUNDING_FEE);

    lines.push(g);

    const assets = Object.keys(byAsset).sort();

    if (isSwap) {
      // Only swaps/auto-exchange show explicit In/Out buckets
      const outs: string[] = [];
      const ins: string[] = [];
      for (const a of assets) {
        const e = byAsset[a];
        if (e.out > 0) outs.push(`${a} -${fmtTrim(e.out)}`);
        if (e.in > 0) ins.push(`${a} +${fmtTrim(e.in)}`);
      }
      if (outs.length) lines.push(`  • ${T.out}:  ${outs.join(", ")}`);
      if (ins.length) lines.push(`  • ${T.in}:   ${ins.join(", ")}`);
    } else if (isFunding) {
      // Funding Fees: split into Received (+) and Paid (-)
      const received: string[] = [];
      const paid: string[] = [];
      for (const a of assets) {
        const e = byAsset[a];
        if (e.in > 0) received.push(`${a} +${fmtTrim(e.in)}`);
        if (e.out > 0) paid.push(`${a} -${fmtTrim(e.out)}`);
      }
      if (received.length) lines.push(`  • ${T.fundingFeesReceived}: ${received.join(", ")}`);
      if (paid.length) lines.push(`  • ${T.fundingFeesPaid}: ${paid.join(", ")}`);
    } else {
      // Others: no "In/Out" words — just signed amounts per asset
      for (const a of assets) {
        const e = byAsset[a];
        const parts: string[] = [];
        if (e.in !== 0) parts.push(`+${fmtTrim(e.in)}`);
        if (e.out !== 0) parts.push(`-${fmtTrim(e.out)}`);
        if (parts.length) lines.push(`  • ${a}: ${parts.join(", ")}`);
      }
    }
    lines.push("");
  }

  // Final balances
  lines.push("—");
  if (finalFromAudit.length > 0) {
    lines.push(T.finalIntro);
    for (const f of finalFromAudit) {
      lines.push(`  • ${f.asset} ${fmtFinal(f.amount)}`);
    }
  }

  return lines.join("\n");
}

// ---------- Summary table (Type & Asset) ----------
export function buildSummaryRows(rows: Row[]): SummaryRow[] {
  const t = totalsByType(rows);
  const out: SummaryRow[] = [];
  for (const typeKey of Object.keys(t)) {
    const m = t[typeKey];
    for (const asset of Object.keys(m)) {
      const e = m[asset];
      const row: SummaryRow = { label: typeKey, asset, in: 0, out: 0, net: 0 };
      if (nonZero(e.pos)) row.in = +fmt(e.pos);
      if (nonZero(e.neg)) row.out = +fmt(e.neg);
      if (nonZero(e.net)) row.net = +fmt(e.net);
      if (row.in || row.out || row.net) out.push(row);
    }
  }
  return out.sort((a, b) => a.label.localeCompare(b.label) || a.asset.localeCompare(b.asset));
}

// ---------- Agent audit text (Keep in UTC+0 generally, or match user offset?)
// User asked to adjust narrative based on offset. Audit is usually technical. 
// "Agent Balance Audit" - lets keep it technical UTC+0 or maybe apply same offset?
// To be safe, I'll apply the same offset logic to Audit timestamps for consistency if "startTs" is passed.
// But `buildAudit` takes `anchorTs` (number). I'll stick to UTC strings in audit unless specifically requested to change audit.
// User said "all the content should be translated... and time... automatically adjusted on the narrative part".
// "Narrative part" implies the Story tab. I will leave Audit as technical UTC+0 (system time) or standard ISO.
// BUT, I will remove milliseconds from it too, by using formatTime with 0 offset.

export function buildAudit(
  rows: Row[],
  params: {
    anchorTs: number;
    endTs?: number;
    baseline?: Record<string, number>;
    anchorTransfer?: { asset: string; amount: number };
  }
): string {
  const { anchorTs, endTs, baseline, anchorTransfer } = params;
  const inRange = rows.filter(r => r.ts >= anchorTs && (endTs ? r.ts <= endTs : true))
    .sort((a, b) => a.ts - b.ts);

  const t = totalsByType(inRange);

  const lines: string[] = [];
  lines.push("Agent Balance Audit");
  lines.push(`Anchor (UTC+0): ${formatTime(anchorTs, 0)}${endTs ? `  →  End: ${formatTime(endTs, 0)}` : ""}`);
  if (baseline && Object.keys(baseline).length) {
    const bl = Object.keys(baseline).map(a => `${a} ${fmt(baseline[a])}`).join("  •  ");
    lines.push("", "Baseline (before anchor):", `  • ${bl}`);
  } else {
    lines.push("", "Baseline: not provided (rolling from zero).");
  }
  if (anchorTransfer) lines.push("", `Applied anchor transfer: ${fmtSignedPlus(anchorTransfer.amount)} ${anchorTransfer.asset}`);

  lines.push("", "Activity after anchor:");
  const perType: string[] = [];
  for (const typeKey of Object.keys(t).sort()) {
    const m = t[typeKey];
    const items: string[] = [];
    for (const a of Object.keys(m)) {
      const e = m[a];
      const segs: string[] = [];
      if (nonZero(e.pos)) segs.push(`+${fmt(e.pos)}`);
      if (nonZero(e.neg)) segs.push(`-${fmt(e.neg)}`);
      if (!segs.length) continue;
      segs.push(`= ${fmt(e.net)}`);
      items.push(`${a}  ${segs.join(" / ")}`);
    }
    if (items.length) perType.push(`• ${typeKey}: ${items.join("  •  ")}`);
  }
  if (perType.length) lines.push(...perType);
  else lines.push("  • No activity.");

  // Net effect
  const assetNet: Record<string, number> = {};
  for (const typeKey of Object.keys(t)) {
    const m = t[typeKey];
    for (const a of Object.keys(m)) assetNet[a] = (assetNet[a] || 0) + m[a].net;
  }
  lines.push("", "Net effect (after anchor):");
  const netLines = Object.keys(assetNet).filter(a => nonZero(assetNet[a]))
    .map(a => `  • ${a}  ${fmtSignedPlus(assetNet[a])}`);
  lines.push(...(netLines.length ? netLines : ["  • 0"]));

  if (baseline && Object.keys(baseline).length) {
    const final: Record<string, number> = { ...baseline };
    if (anchorTransfer) final[anchorTransfer.asset] = (final[anchorTransfer.asset] || 0) + anchorTransfer.amount;
    for (const a of Object.keys(assetNet)) final[a] = (final[a] || 0) + assetNet[a];

    // Dust filter
    for (const dust of ["BFUSD", "FDUSD", "LDUSDT"]) {
      if (Math.abs(final[dust] || 0) < 1e-7) delete final[dust];
    }

    const finalLines = Object.keys(final)
      .filter(a => nonZero(final[a]))
      .sort()
      .map(a => `  • ${a}  ${fmt(final[a])}`);
    if (finalLines.length) {
      lines.push("", "Final expected balances:", ...finalLines);
    }
  }

  return lines.join("\n");
}
