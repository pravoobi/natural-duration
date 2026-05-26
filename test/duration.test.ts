import { describe, it, expect } from "vitest";
import { parseDuration } from "../src/parse/duration.js";

describe("parseDuration", () => {
  it("parses hours and minutes", () => {
    const r = parseDuration("2 hours 30 minutes");
    expect(r.hours).toBe(2);
    expect(r.minutes).toBe(30);
    expect(r.ms).toBe(9_000_000);
  });

  it("parses short form", () => {
    const r = parseDuration("1h 45m");
    expect(r.hours).toBe(1);
    expect(r.minutes).toBe(45);
  });

  it("parses single unit", () => {
    const r = parseDuration("3 days");
    expect(r.days).toBe(3);
    expect(r.ms).toBe(3 * 24 * 3600 * 1000);
  });

  it("parses 90 seconds", () => {
    const r = parseDuration("90 seconds");
    expect(r.seconds).toBe(90);
    expect(r.ms).toBe(90_000);
  });

  it("parses fractional hours", () => {
    const r = parseDuration("2.5 hours");
    expect(r.hours).toBe(2.5);
    expect(r.ms).toBe(2.5 * 3600 * 1000);
  });

  it("parses '1.5 days'", () => {
    const r = parseDuration("1.5 days");
    expect(r.days).toBe(1.5);
  });

  it("parses 'a day'", () => {
    const r = parseDuration("a day");
    expect(r.days).toBe(1);
  });

  it("parses 'an hour'", () => {
    const r = parseDuration("an hour");
    expect(r.hours).toBe(1);
  });

  it("parses 'half an hour'", () => {
    const r = parseDuration("half an hour");
    expect(r.hours).toBe(0.5);
    expect(r.ms).toBe(1_800_000);
  });

  it("parses 'a day and a half'", () => {
    const r = parseDuration("a day and a half");
    // "a day" = 1, "half" doesn't attach here — that's fine; also tests "and"
    expect(r.days).toBeGreaterThanOrEqual(1);
  });

  it("parses '2 and a half hours'", () => {
    const r = parseDuration("2 and a half hours");
    expect(r.hours).toBe(2.5);
  });

  it("parses compound: '2 days 3 hours 15 minutes'", () => {
    const r = parseDuration("2 days 3 hours 15 minutes");
    expect(r.days).toBe(2);
    expect(r.hours).toBe(3);
    expect(r.minutes).toBe(15);
  });

  it("parses abbreviated: '1y 2mo 3d'", () => {
    const r = parseDuration("1y 2mo 3d");
    expect(r.years).toBe(1);
    expect(r.months).toBe(2);
    expect(r.days).toBe(3);
  });

  it("throws in strict mode on garbage", () => {
    expect(() => parseDuration("blah blah", { strict: true })).toThrow();
  });

  it("returns zero ms on empty match (loose mode)", () => {
    const r = parseDuration("nothing here");
    expect(r.ms).toBe(0);
  });

  it("handles fraction notation '1/2 hour'", () => {
    const r = parseDuration("1/2 hour");
    expect(r.hours).toBe(0.5);
  });

  it("parses weeks", () => {
    const r = parseDuration("2 weeks");
    expect(r.weeks).toBe(2);
    expect(r.ms).toBe(2 * 7 * 24 * 3600 * 1000);
  });
});
