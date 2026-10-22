import { dayToDate } from "./demoData";

// Fixed locale and UTC so server and client render identical strings.
const NUM = new Intl.NumberFormat("en-US");
const COMPACT = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const DATE_SHORT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const MONTH_YEAR = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export const fmtNumber = (n: number) => NUM.format(Math.round(n));
export const fmtCompact = (n: number) => (Math.abs(n) >= 10_000 ? COMPACT.format(n) : NUM.format(Math.round(n)));
export const fmtPercent = (ratio: number, digits = 1) => `${(ratio * 100).toFixed(digits)}%`;
export const fmtDay = (day: number) => DATE.format(dayToDate(day));
export const fmtDayShort = (day: number) => DATE_SHORT.format(dayToDate(day));
export const fmtMonthYear = (day: number) => MONTH_YEAR.format(dayToDate(day));
export const isoDay = (day: number) => dayToDate(day).toISOString().slice(0, 10);

export function fmtChange(ratio: number) {
  const sign = ratio > 0 ? "+" : ratio < 0 ? "−" : "";
  return `${sign}${Math.abs(ratio * 100).toFixed(1)}%`;
}

export function fmtDuration(days: number) {
  if (days === 0) return "Same day";
  if (days < 60) return `${days} day${days === 1 ? "" : "s"}`;
  const months = Math.round(days / 30.4);
  return months < 12 ? `${months} months` : `${(days / 365).toFixed(1)} years`;
}
