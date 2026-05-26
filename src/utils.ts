import type { DurationObject } from "./types.js";

export const MS = {
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
} as const;

export function toMs(d: Omit<DurationObject, "ms">): number {
  return (
    (d.years ?? 0) * MS.year +
    (d.months ?? 0) * MS.month +
    (d.weeks ?? 0) * MS.week +
    (d.days ?? 0) * MS.day +
    (d.hours ?? 0) * MS.hour +
    (d.minutes ?? 0) * MS.minute +
    (d.seconds ?? 0) * MS.second
  );
}

export function normalize(raw: Omit<DurationObject, "ms">): DurationObject {
  const ms = toMs(raw);
  return { ...raw, ms };
}

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildUnitPattern(words: string[]): string {
  return words
    .slice()
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join("|");
}

export function trimInput(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}
