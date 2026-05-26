import type {
  ParseOptions,
  RelativeResult,
  Direction,
  DurationObject,
} from "../types.js";
import { getLocale } from "../locales/index.js";
import { trimInput, escapeRegex, MS } from "../utils.js";
import { parseDuration } from "./duration.js";

const MAX_INPUT_LENGTH = 1000;

function addMs(date: Date, ms: number): Date {
  return new Date(date.getTime() + ms);
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function nextWeekday(from: Date, targetDay: number): Date {
  const current = from.getDay();
  let diff = targetDay - current;
  if (diff <= 0) diff += 7;
  return new Date(from.getTime() + diff * MS.day);
}

function prevWeekday(from: Date, targetDay: number): Date {
  const current = from.getDay();
  let diff = current - targetDay;
  if (diff <= 0) diff += 7;
  return new Date(from.getTime() - diff * MS.day);
}

function escapeWords(words: string[]): string {
  return words
    .slice()
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join("|");
}

export function parseRelative(
  input: string,
  options: ParseOptions = {}
): RelativeResult {
  if (input.length > MAX_INPUT_LENGTH) {
    throw new Error(`Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters`);
  }

  const locale = getLocale(options.locale ?? "en");

  // Validate options.now before any arithmetic
  const now = options.now ?? new Date();
  if (isNaN(now.getTime())) {
    throw new Error("options.now must be a valid Date");
  }

  const text = trimInput(input);

  // --- Specials ---
  if (locale.specials.now.includes(text)) {
    const zero: DurationObject = { ms: 0 };
    return { direction: "present", duration: zero, resolvedDate: now };
  }
  if (locale.specials.today.includes(text)) {
    const zero: DurationObject = { ms: 0 };
    return { direction: "present", duration: zero, resolvedDate: startOfDay(now) };
  }
  if (locale.specials.tomorrow.includes(text)) {
    const d: DurationObject = { days: 1, ms: MS.day };
    return { direction: "future", duration: d, resolvedDate: addMs(now, MS.day) };
  }
  if (locale.specials.yesterday.includes(text)) {
    const d: DurationObject = { days: 1, ms: MS.day };
    return { direction: "past", duration: d, resolvedDate: addMs(now, -MS.day) };
  }

  // --- "next <weekday>" / "last <weekday>" ---
  // Build weekday list with day-index stored before sorting
  const weekdayAll = [
    ...locale.weekdays,
    ...locale.weekdayAbbrevs,
  ];
  const weekdayPat = weekdayAll
    .map((w, i) => ({ word: w, day: i % 7 }))
    .sort((a, b) => b.word.length - a.word.length);

  const nextWords = escapeWords(locale.relative.next);
  const lastWords = escapeWords(locale.relative.last);
  // Escape each weekday word individually; list is already sorted longest-first
  const weekdayStr = weekdayPat.map((w) => escapeRegex(w.word)).join("|");

  const nextDayRe = new RegExp(`(?:${nextWords})\\s+(${weekdayStr})`, "i");
  const lastDayRe = new RegExp(`(?:${lastWords})\\s+(${weekdayStr})`, "i");

  let m = text.match(nextDayRe);
  if (m) {
    const entry = weekdayPat.find((w) => w.word === m![1]!.toLowerCase());
    if (entry) {
      const resolved = nextWeekday(now, entry.day);
      const diff = resolved.getTime() - now.getTime();
      return {
        direction: "future",
        duration: { days: Math.round(diff / MS.day), ms: diff },
        resolvedDate: resolved,
      };
    }
  }

  m = text.match(lastDayRe);
  if (m) {
    const entry = weekdayPat.find((w) => w.word === m![1]!.toLowerCase());
    if (entry) {
      const resolved = prevWeekday(now, entry.day);
      const diff = now.getTime() - resolved.getTime();
      return {
        direction: "past",
        duration: { days: Math.round(diff / MS.day), ms: diff },
        resolvedDate: resolved,
      };
    }
  }

  // --- "in X" (future) ---
  const inWords = escapeWords(locale.relative.in);
  const inRe = new RegExp(`^(?:${inWords})\\s+(.+)$`, "i");
  m = text.match(inRe);
  if (m) {
    const duration = parseDuration(m[1]!, options);
    return {
      direction: "future",
      duration,
      resolvedDate: addMs(now, duration.ms),
    };
  }

  // --- "X ago" (past) ---
  const agoWords = escapeWords(locale.relative.ago);
  const agoRe = new RegExp(`^(.+?)\\s+(?:${agoWords})$`, "i");
  m = text.match(agoRe);
  if (m) {
    const duration = parseDuration(m[1]!, options);
    return {
      direction: "past",
      duration,
      resolvedDate: addMs(now, -duration.ms),
    };
  }

  // --- Fallback: bare duration with no direction marker ---
  if (options.strict) {
    throw new Error(`Could not parse relative time from: "${input}"`);
  }

  const duration = parseDuration(text, options);
  const direction: Direction = duration.ms > 0 ? "future" : "present";
  return {
    direction,
    duration,
    resolvedDate: addMs(now, duration.ms),
  };
}
