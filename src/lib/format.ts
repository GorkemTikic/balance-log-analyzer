// src/lib/format.ts

/** Epsilon for floating point comparisons */
export const EPS = 1e-12;

/** Absolute value helper */
export const abs = (x: number) => Math.abs(Number(x) || 0);

/** Returns true if absolute value > EPS */
export const gt = (x: number) => abs(x) > EPS;

/**
 * Standard number formatter for balances.
 * Trims trailing zeros, handles scientific notation, and avoids -0.
 * @param value The number to format
 * @param maxDp Maximum decimal places (default 20 to capture precision)
 */
export function fmtTrim(value: number | string, maxDp = 20): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  if (Math.abs(n) < EPS) return "0";

  let s = String(n);
  // If scientific notation or explicit maxDp requested (internal use), ensure decimals
  if (s.toLowerCase().includes("e")) {
    s = n.toFixed(maxDp);
  }

  // Remove trailing zeros if decimal exists
  if (s.includes(".")) {
    s = s.replace(/\.?0+$/, "");
  }
  return s;
}

/**
 * Formats a number for display in tables (often capitalized as 'fmt' in old code).
 * Legacy behavior: rouunds to 12 decimals, removes trailing zeros.
 * Basically same as fmtTrim but with different default?
 * Let's standardize on fmtTrim logic but keep the name if needed, or alias it.
 */
export function fmt(n: number) {
  return fmtTrim(n, 12);
}

/**
 * Formats a monetary amount with currency symbol or code.
 * e.g. "+5.00 USDT", "-2.50 BTC"
 */
export function fmtMoney(n: number, asset: string) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)} ${asset}`;
}

export function fmtSigned(x: number) {
  const n = Number(x) || 0;
  const sign = n >= 0 ? "+" : "−"; // U+2212
  return `${sign}${fmtTrim(Math.abs(n))}`;
}

/** Formats absolute value of a number (helper for RpnCard) */
export function fmtAbs(x: number) {
  return fmtTrim(Math.abs(x));
}

/** Returns true if value is significantly non-zero */
export function nonZero(v: number) {
  return Math.abs(v) > EPS;
}

/**
 * Formatting for Final Balances (narrative).
 * Shows "0.0000" for near-zero dust, otherwise trims.
 */
export function fmtFinal(amount: number) {
  return Math.abs(amount) < 1e-6 ? "0.0000" : fmtTrim(amount);
}
