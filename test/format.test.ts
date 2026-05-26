import { describe, it, expect } from "vitest";
import { formatDuration, msToComponents } from "../src/format/index.js";

describe("formatDuration", () => {
  it("long style: hours and minutes", () => {
    expect(formatDuration({ hours: 2, minutes: 30, ms: 9_000_000 })).toBe(
      "2 hours 30 minutes"
    );
  });

  it("short style", () => {
    expect(
      formatDuration({ hours: 2, minutes: 30, ms: 9_000_000 }, "short")
    ).toBe("2h 30m");
  });

  it("verbose style with two parts", () => {
    expect(
      formatDuration({ hours: 2, minutes: 30, ms: 9_000_000 }, "verbose")
    ).toBe("2 hours and 30 minutes");
  });

  it("verbose style with three parts", () => {
    expect(
      formatDuration(
        { hours: 1, minutes: 30, seconds: 15, ms: 0 },
        "verbose"
      )
    ).toBe("1 hour, 30 minutes and 15 seconds");
  });

  it("singular unit", () => {
    expect(formatDuration({ hours: 1, ms: 3_600_000 })).toBe("1 hour");
  });

  it("zero duration long", () => {
    expect(formatDuration({ ms: 0 })).toBe("0 seconds");
  });

  it("zero duration short", () => {
    expect(formatDuration({ ms: 0 }, "short")).toBe("0s");
  });

  it("accepts raw ms number", () => {
    expect(formatDuration(3_600_000)).toBe("1 hour");
  });

  it("formats days", () => {
    expect(formatDuration({ days: 3, ms: 0 }, "short")).toBe("3d");
  });
});

describe("msToComponents", () => {
  it("decomposes 90 minutes into 1 hour 30 minutes", () => {
    const r = msToComponents(90 * 60 * 1000);
    expect(r.hours).toBe(1);
    expect(r.minutes).toBe(30);
  });

  it("decomposes 1 day", () => {
    const r = msToComponents(24 * 3600 * 1000);
    expect(r.days).toBe(1);
    expect(r.hours).toBeUndefined();
  });
});
