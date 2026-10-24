import { N8AOPass } from "n8ao";
import type { OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

/**
 * Quality tiers that spend the GPU where it shows: the camera is still most of the time, and a still frame can afford ambient occlusion that a moving
 * one can't on a weak GPU. Low renders directly; medium adds ambient occlusion at rest, faded in; high has it while moving too. Effects only at rest
 * is how progressive model viewers such as Sketchfab's stay fast; the AO is N8AO, configured as the r3f renderer's
 */

export type Tier = "low" | "medium" | "high";
export type Quality = Tier | "auto";

/** `auto` starts at medium, and drops to low for good once moving frames average slower than 40 per second */
export type TierGovernor = { readonly quality: Quality; tier: Tier; sum: number; count: number };

export type RenderPath = {
  readonly tier: Tier;
  /** With ambient occlusion, faded in by its intensity over the first frames at rest */
  readonly composer: EffectComposer | undefined;
  readonly ao: { readonly configuration: { intensity: number } } | undefined;
  readonly fade: { frame: number };
};

const pixelRatioCaps: Record<Tier, number> = { low: 1, medium: 1.5, high: 2 };
const windowSize = 30;
const slowFrameMs = 25;
/** Longer intervals are pauses between moves, not slow frames */
const pauseMs = 250;
const fadeFrames = 6;
const intensity = 2;

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

/** Also sets the renderer's pixel ratio, capped by the tier */
export function createRenderPath(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera | OrthographicCamera, tier: Tier): RenderPath {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCaps[tier]));
  if (tier === "low") {
    return { tier, composer: undefined, ao: undefined, fade: { frame: 0 } };
  }
  const composer = new EffectComposer(renderer);
  const ao = new N8AOPass(scene, camera);
  Object.assign(ao.configuration, {
    aoRadius: 40,
    distanceFalloff: 0.2,
    screenSpaceRadius: true,
    halfRes: true,
    denoiseSamples: 4,
    gammaCorrection: false,
  });
  // Multisampled, as SMAA, which N8AO suggests, would lose the antialiased alpha at edges over the transparent background
  ao.beautyRenderTarget.samples = 4;
  composer.addPass(ao);
  // Tone mapping and sRGB, which rendering to the screen otherwise does
  composer.addPass(new OutputPass());
  return { tier, composer, ao, fade: { frame: 0 } };
}

/** Renders a frame; true while the frame at rest needs more frames to fade its ambient occlusion in */
export function renderPath(
  path: RenderPath,
  renderer: WebGLRenderer,
  scene: Scene,
  camera: PerspectiveCamera | OrthographicCamera,
  moving: boolean
): boolean {
  if (!path.composer || !path.ao || (moving && path.tier === "medium")) {
    path.fade.frame = 0;
    renderer.render(scene, camera);
    return false;
  }
  path.fade.frame = path.tier === "high" ? fadeFrames : Math.min(fadeFrames, path.fade.frame + 1);
  path.ao.configuration.intensity = (intensity * path.fade.frame) / fadeFrames;
  path.composer.render();
  return path.fade.frame < fadeFrames;
}

export function disposeRenderPath(path: RenderPath): void {
  path.composer?.passes.forEach((p) => p.dispose());
  path.composer?.dispose();
}
