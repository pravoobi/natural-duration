import type { DurationObject, FormatStyle } from "../types.js";
import { getLocale } from "../locales/index.js";

type UnitKey = keyof Omit<DurationObject, "ms">;

const ORDER: UnitKey[] = [
  "years",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
];

function pluralize(value: number, singular: string): string {
  return value === 1 ? `1 ${singular}` : `${value} ${singular}s`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatDuration(
  input: DurationObject | number,
  style: FormatStyle = "long",
  locale = "en"
): string {
  const loc = getLocale(locale);

  let duration: DurationObject;
  if (typeof input === "number") {
    duration = msToComponents(input);
  } else {
    duration = input;
  }

  const parts: string[] = [];

  for (const key of ORDER) {
    const raw = duration[key];
    if (!raw || raw === 0) continue;
    const value = round2(raw);

    if (style === "short") {
      const abbrev = loc.shortUnits[key === "years" ? "year"
        : key === "months" ? "month"
        : key === "weeks" ? "week"
        : key === "days" ? "day"
        : key === "hours" ? "hour"
        : key === "minutes" ? "minute"
        : "second"];
      parts.push(`${value}${abbrev}`);
    } else {
      const singular = key.replace(/s$/, "");
      parts.push(pluralize(value, singular));
    }
  }

  if (parts.length === 0) return style === "short" ? "0s" : "0 seconds";

  if (style === "verbose") {
    if (parts.length === 1) return parts[0]!;
    const last = parts.pop()!;
    return parts.join(", ") + " and " + last;
  }

  if (style === "short") return parts.join(" ");

  // long: join with space
  return parts.join(" ");
}

export function msToComponents(ms: number): DurationObject {
  let remaining = Math.abs(ms);
  const years = Math.floor(remaining / (365 * 24 * 3600 * 1000));
  remaining -= years * 365 * 24 * 3600 * 1000;
  const months = Math.floor(remaining / (30 * 24 * 3600 * 1000));
  remaining -= months * 30 * 24 * 3600 * 1000;
  const weeks = Math.floor(remaining / (7 * 24 * 3600 * 1000));
  remaining -= weeks * 7 * 24 * 3600 * 1000;
  const days = Math.floor(remaining / (24 * 3600 * 1000));
  remaining -= days * 24 * 3600 * 1000;
  const hours = Math.floor(remaining / (3600 * 1000));
  remaining -= hours * 3600 * 1000;
  const minutes = Math.floor(remaining / 60000);
  remaining -= minutes * 60000;
  const seconds = Math.floor(remaining / 1000);

  const result: Partial<DurationObject> = {};
  if (years) result.years = years;
  if (months) result.months = months;
  if (weeks) result.weeks = weeks;
  if (days) result.days = days;
  if (hours) result.hours = hours;
  if (minutes) result.minutes = minutes;
  if (seconds) result.seconds = seconds;
  return { ...result, ms: Math.abs(ms) };
}
