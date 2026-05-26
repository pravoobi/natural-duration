export interface DurationObject {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  ms: number;
}

export interface ParseOptions {
  strict?: boolean;
  locale?: string;
  now?: Date;
}

export interface ParseResult<T> {
  value: T;
  confidence: number;
  input: string;
}

export type Direction = "future" | "past" | "present";

export interface RelativeResult {
  direction: Direction;
  duration: DurationObject;
  resolvedDate: Date;
}

export type RecurringType = "interval" | "weekday" | "monthly" | "daily";

export interface RecurringInterval {
  type: "interval";
  every: Partial<Omit<DurationObject, "ms">>;
  ms: number;
}

export interface RecurringWeekday {
  type: "weekday";
  day: number;
  hour?: number;
  minute?: number;
  nth?: number;
}

export interface RecurringDaily {
  type: "daily";
  hour?: number;
  minute?: number;
}

export interface RecurringMonthly {
  type: "monthly";
  dayOfMonth: number;
  hour?: number;
  minute?: number;
}

export type RecurringResult =
  | RecurringInterval
  | RecurringWeekday
  | RecurringDaily
  | RecurringMonthly;

export type FormatStyle = "long" | "short" | "verbose";

export interface LocaleDefinition {
  units: {
    year: string[];
    month: string[];
    week: string[];
    day: string[];
    hour: string[];
    minute: string[];
    second: string[];
  };
  shortUnits: {
    year: string;
    month: string;
    week: string;
    day: string;
    hour: string;
    minute: string;
    second: string;
  };
  relative: {
    future: string[];
    past: string[];
    ago: string[];
    in: string[];
    next: string[];
    last: string[];
  };
  recurring: {
    every: string[];
    at: string[];
  };
  weekdays: string[];
  weekdayAbbrevs: string[];
  specials: {
    today: string[];
    tomorrow: string[];
    yesterday: string[];
    now: string[];
    halfWords: string[];
    aWord: string[];
    andWord: string[];
  };
}
