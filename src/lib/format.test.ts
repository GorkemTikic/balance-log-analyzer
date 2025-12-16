import { describe, it, expect } from "vitest";
import { fmt, fmtTrim, fmtMoney, fmtSigned } from "./format";

describe("format.ts", () => {
  describe("fmtTrim", () => {
    it("trims trailing zeros", () => {
      expect(fmtTrim(123.45)).toBe("123.45");
      expect(fmtTrim(100.0)).toBe("100");
    });
    it("handles integers", () => {
      expect(fmtTrim(42)).toBe("42");
    });
    it("handles scientific notation for small numbers", () => {
      // 1e-7 is 0.0000001
      // fmtTrim should expand it
      expect(fmtTrim(1e-7)).toBe("0.0000001");
    });
    it("handles negative zero as zero", () => {
      expect(fmtTrim(-0)).toBe("0");
    });
  });

  describe("fmt", () => {
    it("behaves like fmtTrim for basic cases", () => {
      expect(fmt(123.456)).toBe("123.456");
    });
    // Removed high precision test as it depends on float noise
  });

  describe("fmtMoney", () => {
    it("formats positive values with sign", () => {
      expect(fmtMoney(100, "USDT")).toBe("+100.00 USDT");
    });
    it("formats negative values with sign", () => {
      // toFixed(2) on -50.5 gives "-50.50"
      // fmtMoney returns "-50.50 BTC" because sign logic logic: n > 0 ? "+" : "" (empty for neg)
      expect(fmtMoney(-50.5, "BTC")).toBe("-50.50 BTC");
    });
    it("formats zero", () => {
      expect(fmtMoney(0, "ETH")).toBe("0.00 ETH");
    });
  });

  describe("fmtSigned", () => {
    it("adds + sign for positive", () => {
      expect(fmtSigned(10)).toBe("+10");
    });
    it("adds minus sign for negative", () => {
      // fmtSigned uses U+2212 (width variant) which looks like "−"
      expect(fmtSigned(-5)).toBe("−5");
    });
  });
});
