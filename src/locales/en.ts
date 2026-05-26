import type { LocaleDefinition } from "../types.js";

export const en: LocaleDefinition = {
  units: {
    year: ["year", "years", "yr", "yrs", "y"],
    month: ["month", "months", "mo", "mos"],
    week: ["week", "weeks", "wk", "wks", "w"],
    day: ["day", "days", "d"],
    hour: ["hour", "hours", "hr", "hrs", "h"],
    // "m" listed last so longer tokens (min, mins, mo) take precedence in combined alt
    minute: ["minute", "minutes", "min", "mins", "m"],
    second: ["second", "seconds", "sec", "secs", "s"],
  },
  shortUnits: {
    year: "y",
    month: "mo",
    week: "w",
    day: "d",
    hour: "h",
    minute: "m",
    second: "s",
  },
  relative: {
    future: ["in", "after"],
    past: ["ago", "before", "earlier"],
    ago: ["ago"],
    in: ["in"],
    next: ["next"],
    last: ["last", "previous", "prev"],
  },
  recurring: {
    every: ["every", "each", "per"],
    at: ["at", "@"],
  },
  weekdays: [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ],
  weekdayAbbrevs: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
  specials: {
    today: ["today"],
    tomorrow: ["tomorrow", "tmr", "tmrw"],
    yesterday: ["yesterday"],
    now: ["now", "immediately"],
    halfWords: ["half", "a half", "and a half"],
    aWord: ["a", "an", "one"],
    andWord: ["and"],
  },
};
