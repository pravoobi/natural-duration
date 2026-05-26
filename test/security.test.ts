import { describe, it, expect } from "vitest";
import { parseDuration } from "../src/parse/duration.js";
import { parseRelative } from "../src/parse/relative.js";
import { parseRecurring } from "../src/parse/recurring.js";
import { registerLocale } from "../src/locales/index.js";
import type { LocaleDefinition } from "../src/types.js";

const OVER_LIMIT = "a".repeat(1001);

describe("input length guard", () => {
  it("parseDuration throws on oversized input", () => {
    expect(() => parseDuration(OVER_LIMIT)).toThrow("maximum length");
  });

  it("parseRelative throws on oversized input", () => {
    expect(() => parseRelative(OVER_LIMIT)).toThrow("maximum length");
  });

  it("parseRecurring throws on oversized input", () => {
    expect(() => parseRecurring(OVER_LIMIT)).toThrow("maximum length");
  });
});

describe("invalid options.now", () => {
  it("throws on NaN date", () => {
    expect(() =>
      parseRelative("in 3 days", { now: new Date("not-a-date") })
    ).toThrow("valid Date");
  });
});

describe("parseTime out-of-range rejection", () => {
  it("returns interval result without crashing for invalid time", () => {
    // "every Monday at 99:99" — parseTime returns null, so no time fields
    const r = parseRecurring("every Monday at 99:99");
    expect(r.type).toBe("weekday");
    if (r.type === "weekday") {
      expect(r.hour).toBeUndefined();
      expect(r.minute).toBeUndefined();
    }
  });
});

describe("regex injection via community locale is neutralized", () => {
  it("locale words with regex metacharacters are escaped", () => {
    const maliciousLocale: LocaleDefinition = {
      units: {
        year: ["year", "years", "yr", "yrs", "y"],
        month: ["month", "months", "mo", "mos"],
        week: ["week", "weeks", "wk", "wks", "w"],
        day: ["day", "days", "d"],
        hour: ["hour", "hours", "hr", "hrs", "h"],
        minute: ["minute", "minutes", "min", "mins", "m"],
        second: ["second", "seconds", "sec", "secs", "s"],
      },
      shortUnits: { year: "y", month: "mo", week: "w", day: "d", hour: "h", minute: "m", second: "s" },
      relative: {
        future: ["in"],
        past: ["ago"],
        ago: ["ago"],
        in: ["in"],
        next: ["next(+(+"], // malicious: unmatched parens
        last: ["last"],
      },
      recurring: { every: ["every"], at: ["at"] },
      weekdays: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      weekdayAbbrevs: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
      specials: {
        today: ["today"],
        tomorrow: ["tomorrow"],
        yesterday: ["yesterday"],
        now: ["now"],
        halfWords: ["half"],
        aWord: ["a", "an", "one"],
        andWord: ["and"],
      },
    };

    registerLocale("test-malicious", maliciousLocale);

    // Should not throw a SyntaxError from invalid regex construction
    expect(() =>
      parseRelative("next monday", { locale: "test-malicious" })
    ).not.toThrow(SyntaxError);
  });
});
