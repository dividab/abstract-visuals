/**
 * Quality tiers by resolution, the cheapest lever on a weak GPU: low renders a pixel per CSS pixel, medium up to 1.5, and high, the default, the
 * screen's own pixel ratio as the r3f renderer. `auto` starts high and drops to low for good once moving frames are slow, as model viewers lower
 * their resolution under load
 */

export type Tier = "low" | "medium" | "high";
export type Quality = Tier | "auto";

/** `auto` starts at high, and drops to low for good once moving frames average slower than 40 per second */
export type TierGovernor = { readonly quality: Quality; tier: Tier; sum: number; count: number };

const pixelRatioCaps: Record<Tier, number> = { low: 1, medium: 1.5, high: Infinity };
const windowSize = 30;
const slowFrameMs = 25;
/** Longer intervals are pauses between moves, not slow frames */
const pauseMs = 250;

/** Records the time between two frames while the camera moves; true when that dropped the tier */
export function recordFrame(governor: TierGovernor, intervalMs: number): boolean {
  if (governor.quality !== "auto" || governor.tier === "low" || intervalMs > pauseMs) {
    return false;
  }
  governor.sum += intervalMs;
  governor.count += 1;
  if (governor.count < windowSize) {
    return false;
  }
  const slow = governor.sum / governor.count > slowFrameMs;
  Object.assign(governor, { sum: 0, count: 0 }, slow ? { tier: "low" } : {});
  return slow;
}

export function getPixelRatio(tier: Tier, devicePixelRatio: number): number {
  return Math.min(devicePixelRatio, pixelRatioCaps[tier]);
}
