import { describe, it, expect } from "vitest";
import { parseRelative } from "../src/parse/relative.js";

const FIXED_NOW = new Date("2024-06-12T12:00:00.000Z"); // Wednesday

describe("parseRelative", () => {
  it("parses 'in 3 days'", () => {
    const r = parseRelative("in 3 days", { now: FIXED_NOW });
    expect(r.direction).toBe("future");
    expect(r.duration.days).toBe(3);
    expect(r.resolvedDate.getTime()).toBe(
      FIXED_NOW.getTime() + 3 * 24 * 3600 * 1000
    );
  });

  it("parses '5 minutes ago'", () => {
    const r = parseRelative("5 minutes ago", { now: FIXED_NOW });
    expect(r.direction).toBe("past");
    expect(r.duration.minutes).toBe(5);
    expect(r.resolvedDate.getTime()).toBe(FIXED_NOW.getTime() - 5 * 60 * 1000);
  });

  it("parses 'in 2 weeks'", () => {
    const r = parseRelative("in 2 weeks", { now: FIXED_NOW });
    expect(r.direction).toBe("future");
    expect(r.duration.weeks).toBe(2);
  });

  it("parses 'tomorrow'", () => {
    const r = parseRelative("tomorrow", { now: FIXED_NOW });
    expect(r.direction).toBe("future");
    expect(r.resolvedDate.getTime()).toBe(
      FIXED_NOW.getTime() + 24 * 3600 * 1000
    );
  });

  it("parses 'yesterday'", () => {
    const r = parseRelative("yesterday", { now: FIXED_NOW });
    expect(r.direction).toBe("past");
    expect(r.resolvedDate.getTime()).toBe(
      FIXED_NOW.getTime() - 24 * 3600 * 1000
    );
  });

  it("parses 'today'", () => {
    const r = parseRelative("today", { now: FIXED_NOW });
    expect(r.direction).toBe("present");
  });

  it("parses 'now'", () => {
    const r = parseRelative("now", { now: FIXED_NOW });
    expect(r.direction).toBe("present");
    expect(r.duration.ms).toBe(0);
  });

  it("parses 'next Monday' from Wednesday", () => {
    const r = parseRelative("next Monday", { now: FIXED_NOW });
    expect(r.direction).toBe("future");
    // Monday is day 1; from Wednesday (day 3), next Monday is 5 days ahead
    expect(r.resolvedDate.getDay()).toBe(1);
    expect(r.resolvedDate.getTime()).toBeGreaterThan(FIXED_NOW.getTime());
  });

  it("parses 'last Friday' from Wednesday", () => {
    const r = parseRelative("last Friday", { now: FIXED_NOW });
    expect(r.direction).toBe("past");
    expect(r.resolvedDate.getDay()).toBe(5);
    expect(r.resolvedDate.getTime()).toBeLessThan(FIXED_NOW.getTime());
  });

  it("parses 'in 1 hour 30 minutes'", () => {
    const r = parseRelative("in 1 hour 30 minutes", { now: FIXED_NOW });
    expect(r.direction).toBe("future");
    expect(r.duration.hours).toBe(1);
    expect(r.duration.minutes).toBe(30);
  });

  it("parses '2 hours ago'", () => {
    const r = parseRelative("2 hours ago", { now: FIXED_NOW });
    expect(r.direction).toBe("past");
    expect(r.resolvedDate.getTime()).toBe(
      FIXED_NOW.getTime() - 2 * 3600 * 1000
    );
  });
});
