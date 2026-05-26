import type { DurationObject, ParseOptions, ParseResult } from "../types.js";
import { getLocale } from "../locales/index.js";
import { buildUnitPattern, normalize, trimInput } from "../utils.js";

const MAX_INPUT_LENGTH = 1000;

type UnitKey = keyof Omit<DurationObject, "ms">;

interface UnitEntry {
  key: UnitKey;
  pattern: string;
}

function buildParser(locale: ReturnType<typeof getLocale>) {
  const unitMap: Array<[UnitKey, string[]]> = [
    ["years", locale.units.year],
    ["months", locale.units.month],
    ["weeks", locale.units.week],
    ["days", locale.units.day],
    ["hours", locale.units.hour],
    ["minutes", locale.units.minute],
    ["seconds", locale.units.second],
  ];

  const unitPatterns: UnitEntry[] = unitMap.map(([key, words]) => ({
    key,
    pattern: buildUnitPattern(words),
  }));

  const numPattern = `(?:\\d+\\.\\d+|\\d+\\/\\d+|\\d+)`;
  const unitAlts = unitPatterns.map((u) => u.pattern).join("|");

  // "2 and a half hours" — must come before fullPattern to consume the span first
  const andHalfPattern = new RegExp(
    `(${numPattern})\\s+and\\s+a\\s+half\\s+(${unitAlts})s?(?=\\s|$|,)`,
    "gi"
  );

  // "half an hour", "half a day"
  const halfPattern = new RegExp(
    `\\bhalf\\s+an?\\s+(${unitAlts})s?(?=\\s|$|,)`,
    "gi"
  );

  // "a day", "an hour", "one week"
  const aPattern = new RegExp(
    `\\b(?:a(?:n)?|one)\\s+(${unitAlts})s?(?=\\s|$|,)`,
    "gi"
  );

  // "2 hours", "90 seconds", "1.5 days" — no optional "and a half" group here
  const fullPattern = new RegExp(
    `(${numPattern})\\s*(${unitAlts})s?(?=\\s|$|,)`,
    "gi"
  );

  // bare unit name only, e.g. "hour" → 1 hour (used by recurring "each hour")
  const barePattern = new RegExp(`^(${unitAlts})s?$`, "i");

  return { unitPatterns, andHalfPattern, halfPattern, aPattern, fullPattern, barePattern };
}

function parseNumber(raw: string): number {
  if (raw.includes("/")) {
    const [num, den] = raw.split("/");
    return parseFloat(num!) / parseFloat(den!);
  }
  return parseFloat(raw);
}

function resolveUnit(matched: string, unitPatterns: UnitEntry[]): UnitKey | null {
  for (const { key, pattern } of unitPatterns) {
    if (new RegExp(`^(?:${pattern})s?$`, "i").test(matched)) return key;
  }
  return null;
}

function applyValue(acc: Partial<Record<UnitKey, number>>, key: UnitKey, value: number) {
  acc[key] = (acc[key] ?? 0) + value;
}

// Replace matched text with spaces so later patterns can't re-match the same span.
function consumeMatches(
  text: string,
  pattern: RegExp,
  handler: (groups: string[]) => void
): string {
  return text.replace(pattern, (full, ...groups) => {
    handler(groups as string[]);
    return " ".repeat(full.length);
  });
}

export function parseDuration(
  input: string,
  options: ParseOptions = {}
): DurationObject {
  if (input.length > MAX_INPUT_LENGTH) {
    throw new Error(`Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters`);
  }
  const locale = getLocale(options.locale ?? "en");
  const raw = trimInput(input);
  const { unitPatterns, andHalfPattern, halfPattern, aPattern, fullPattern, barePattern } =
    buildParser(locale);

  const acc: Partial<Record<UnitKey, number>> = {};
  let matched = false;

  let text = raw;

  // 1. "2 and a half hours"
  text = consumeMatches(text, andHalfPattern, ([numStr, unitStr]) => {
    const key = resolveUnit(unitStr!, unitPatterns);
    if (key) { applyValue(acc, key, parseNumber(numStr!) + 0.5); matched = true; }
  });

  // 2. "half an hour"
  text = consumeMatches(text, halfPattern, ([unitStr]) => {
    const key = resolveUnit(unitStr!, unitPatterns);
    if (key) { applyValue(acc, key, 0.5); matched = true; }
  });

  // 3. "a/an/one unit"
  text = consumeMatches(text, aPattern, ([unitStr]) => {
    const key = resolveUnit(unitStr!, unitPatterns);
    if (key) { applyValue(acc, key, 1); matched = true; }
  });

  // 4. "N unit" — result not reassigned; text from step 3 already has earlier spans blanked
  consumeMatches(text, fullPattern, ([numStr, unitStr]) => {
    const key = resolveUnit(unitStr!, unitPatterns);
    if (key) { applyValue(acc, key, parseNumber(numStr!)); matched = true; }
  });

  // 5. Bare unit with no number (e.g. "hour" → 1)
  if (!matched) {
    const trimmed = raw.trim();
    const m = trimmed.match(barePattern);
    if (m) {
      const key = resolveUnit(m[1]!, unitPatterns);
      if (key) { applyValue(acc, key, 1); matched = true; }
    }
  }

  if (!matched && options.strict) {
    throw new Error(`Could not parse duration from: "${input}"`);
  }

  return normalize(acc);
}

export function parseDurationSafe(
  input: string,
  options: ParseOptions = {}
): ParseResult<DurationObject> {
  try {
    const value = parseDuration(input, options);
    const wordCount = trimInput(input).split(/\s+/).length;
    const confidence = value.ms > 0 ? Math.min(1, 1 / Math.max(1, wordCount - 1)) : 0;
    return { value, confidence, input };
  } catch {
    return { value: { ms: 0 }, confidence: 0, input };
  }
}
