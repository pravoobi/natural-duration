import { describe, it, expect } from "vitest";
import { parseRecurring } from "../src/parse/recurring.js";

describe("parseRecurring", () => {
  it("parses 'every 10 minutes'", () => {
    const r = parseRecurring("every 10 minutes");
    expect(r.type).toBe("interval");
    if (r.type === "interval") {
      expect(r.every.minutes).toBe(10);
      expect(r.ms).toBe(10 * 60 * 1000);
    }
  });

  it("parses 'every 2 hours'", () => {
    const r = parseRecurring("every 2 hours");
    expect(r.type).toBe("interval");
    if (r.type === "interval") {
      expect(r.every.hours).toBe(2);
    }
  });

  it("parses 'every Monday'", () => {
    const r = parseRecurring("every Monday");
    expect(r.type).toBe("weekday");
    if (r.type === "weekday") {
      expect(r.day).toBe(1); // Monday = 1
    }
  });

  it("parses 'every Monday at 9am'", () => {
    const r = parseRecurring("every Monday at 9am");
    expect(r.type).toBe("weekday");
    if (r.type === "weekday") {
      expect(r.day).toBe(1);
      expect(r.hour).toBe(9);
      expect(r.minute).toBe(0);
    }
  });

  it("parses 'every 2nd Tuesday'", () => {
    const r = parseRecurring("every 2nd Tuesday");
    expect(r.type).toBe("weekday");
    if (r.type === "weekday") {
      expect(r.day).toBe(2); // Tuesday
      expect(r.nth).toBe(2);
    }
  });

  it("parses 'daily at 9am'", () => {
    const r = parseRecurring("every daily at 9am");
    expect(r.type).toBe("daily");
    if (r.type === "daily") {
      expect(r.hour).toBe(9);
      expect(r.minute).toBe(0);
    }
  });

  it("parses 'every Friday at 2:30pm'", () => {
    const r = parseRecurring("every Friday at 2:30pm");
    expect(r.type).toBe("weekday");
    if (r.type === "weekday") {
      expect(r.day).toBe(5); // Friday
      expect(r.hour).toBe(14);
      expect(r.minute).toBe(30);
    }
  });

  it("parses 'each hour'", () => {
    const r = parseRecurring("each hour");
    expect(r.type).toBe("interval");
    if (r.type === "interval") {
      expect(r.every.hours).toBe(1);
    }
  });

  it("parses 'every 30 seconds'", () => {
    const r = parseRecurring("every 30 seconds");
    expect(r.type).toBe("interval");
    if (r.type === "interval") {
      expect(r.every.seconds).toBe(30);
      expect(r.ms).toBe(30_000);
    }
  });

  it("throws in strict mode on garbage", () => {
    expect(() => parseRecurring("blah blah", { strict: true })).toThrow();
  });
});
