import type { ParseOptions, RecurringResult } from "../types.js";
import { getLocale } from "../locales/index.js";
import { trimInput, escapeRegex } from "../utils.js";
import { parseDuration } from "./duration.js";

const MAX_INPUT_LENGTH = 1000;

function parseTime(text: string): { hour: number; minute: number } | null {
  const m = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return null;
  let hour = parseInt(m[1]!, 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  const meridiem = m[3]?.toLowerCase();
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

const ORDINALS: Record<string, number> = {
  first: 1, "1st": 1,
  second: 2, "2nd": 2,
  third: 3, "3rd": 3,
  fourth: 4, "4th": 4,
  fifth: 5, "5th": 5,
};

function escapeWords(words: string[]): string {
  return words
    .slice()
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join("|");
}

export function parseRecurring(
  input: string,
  options: ParseOptions = {}
): RecurringResult {
  if (input.length > MAX_INPUT_LENGTH) {
    throw new Error(`Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters`);
  }

  const locale = getLocale(options.locale ?? "en");
  const text = trimInput(input);

  const everyWords = escapeWords(locale.recurring.every);
  const atWords = escapeWords(locale.recurring.at);
  const everyRe = new RegExp(`^(?:${everyWords})\\s+(.+)$`, "i");

  const m = text.match(everyRe);
  if (!m) {
    if (options.strict) throw new Error(`Could not parse recurring expression: "${input}"`);
    const dur = parseDuration(text, options);
    return { type: "interval", every: {}, ms: dur.ms };
  }

  const rest = m[1]!.trim();

  // --- "daily at 9am" ---
  const dailyRe = new RegExp(`^daily(?:\\s+(?:${atWords})\\s+(.+))?$`, "i");
  const dailyMatch = rest.match(dailyRe);
  if (dailyMatch) {
    const time = dailyMatch[1] ? parseTime(dailyMatch[1].trim()) : null;
    return {
      type: "daily",
      ...(time ?? {}),
    };
  }

  // --- "nth weekday at time" e.g. "every 2nd Tuesday at 9am" ---
  const weekdays = [...locale.weekdays, ...locale.weekdayAbbrevs];
  const weekdayStr = weekdays
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join("|");
  const ordinalStr = Object.keys(ORDINALS)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join("|");

  const nthWeekdayRe = new RegExp(
    `^(?:(${ordinalStr})\\s+)?(${weekdayStr})(?:\\s+(?:${atWords})\\s+(.+))?$`,
    "i"
  );
  const nthMatch = rest.match(nthWeekdayRe);
  if (nthMatch) {
    const dayWord = nthMatch[2]!.toLowerCase();
    let dayIndex = locale.weekdays.indexOf(dayWord);
    if (dayIndex === -1) dayIndex = locale.weekdayAbbrevs.indexOf(dayWord);

    if (dayIndex !== -1) {
      const time = nthMatch[3] ? parseTime(nthMatch[3].trim()) : null;
      const nth = nthMatch[1] ? ORDINALS[nthMatch[1].toLowerCase()] : undefined;
      return {
        type: "weekday",
        day: dayIndex,
        ...(nth !== undefined ? { nth } : {}),
        ...(time ?? {}),
      };
    }
  }

  // --- "every N units at time" (interval) ---
  const atRe = new RegExp(`^(.+?)(?:\\s+(?:${atWords})\\s+(.+))?$`, "i");
  const intervalMatch = rest.match(atRe);
  if (intervalMatch) {
    const durText = intervalMatch[1]!.trim();

    try {
      const dur = parseDuration(durText, { ...options, strict: true });
      const time = intervalMatch[2] ? parseTime(intervalMatch[2].trim()) : null;

      // Day-based interval with an explicit time → daily schedule
      if (time && dur.days === 1 && !dur.hours && !dur.minutes && !dur.seconds) {
        return { type: "daily", ...time };
      }

      const { ms: _ms, ...every } = dur;
      return { type: "interval", every, ms: dur.ms };
    } catch {
      // fall through
    }
  }

  if (options.strict) {
    throw new Error(`Could not parse recurring expression: "${input}"`);
  }

  return { type: "interval", every: {}, ms: 0 };
}
