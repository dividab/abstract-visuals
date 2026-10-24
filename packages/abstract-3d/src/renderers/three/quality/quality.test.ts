import { describe, expect, it } from "vitest";
import type { Quality, TierGovernor } from "./quality.js";
import { getPixelRatio, recordFrame } from "./quality.js";

const governor = (quality: Quality): TierGovernor => ({ quality, tier: quality === "auto" ? "high" : quality, sum: 0, count: 0 });
const record = (g: TierGovernor, intervals: ReadonlyArray<number>): ReadonlyArray<boolean> => intervals.map((ms) => recordFrame(g, ms));

describe("recordFrame", () => {
  it("keeps a fixed quality", () => {
    const g = governor("high");
    record(g, Array<number>(100).fill(100));
    expect(g.tier).toBe("high");
  });

  it("drops auto to low for good when moving frames are slow", () => {
    const g = governor("auto");
    expect(record(g, Array<number>(30).fill(40)).filter(Boolean)).toHaveLength(1);
    record(g, Array<number>(100).fill(5));
    expect(g.tier).toBe("low");
  });

  it("keeps auto at high at 60 frames per second, ignoring the pauses between moves", () => {
    const g = governor("auto");
    record(
      g,
      Array.from({ length: 100 }, (_, i) => (i % 10 === 0 ? 2000 : 16.7))
    );
    expect(g.tier).toBe("high");
  });
});

describe("getPixelRatio", () => {
  it("caps the screen's pixel ratio by the tier, and high is the screen's own, as the r3f renderer's", () => {
    expect([getPixelRatio("low", 3), getPixelRatio("medium", 3), getPixelRatio("high", 3)]).toEqual([1, 1.5, 3]);
    expect(getPixelRatio("high", 1)).toBe(1);
  });
});
