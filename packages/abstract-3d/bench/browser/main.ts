import type { View } from "../../src/abstract-3d.js";
import type { CameraOptions, Quality, ViewerOptions } from "../../src/renderers/three/index.js";
import { createViewer, updateViewer } from "../../src/renderers/three/index.js";
import { createGroupId, repeatScene, scenes } from "../scenes.js";

/** A viewer configured by the URL, driven by run.ts through `window.harness`; with `report`, it posts its startup times to windows.ts */

const params = new URLSearchParams(window.location.search);
const scene = repeatScene(scenes[params.get("scene") ?? "systemair3"]!, Number(params.get("copies") ?? "1"));
const options: ViewerOptions<string> = {
  scene,
  createGroupId,
  camera: { type: params.get("camera") ?? "Perspective", near: 100, far: 200000 } as CameraOptions,
  view: (params.get("view") ?? "front") as View,
  quality: (params.get("quality") ?? "medium") as Quality,
  gizmo: params.get("gizmo") === "axes" ? { type: "Viewport" } : { type: "Viewcube" },
  shadows: params.get("shadows") !== "off",
  groundShadow: params.get("groundShadow") !== "off",
  studio: params.get("studio") !== "off",
  onClickGroup: (id) => updateViewer(viewer, { selectedIds: { [id]: true } }),
  getTooltips: (id) => [{ id, pos: { x: 0, y: 0, z: 0 }, content: id.slice(0, 8) }],
};
const viewer = createViewer(document.getElementById("app")!, options);

declare global {
  interface Window {
    harness: { readonly viewer: typeof viewer; readonly created: number; readonly swap: (name: string) => void };
  }
}
window.harness = { viewer, created: performance.now(), swap: (name) => updateViewer(viewer, { scene: scenes[name] }) };
if (params.has("report")) {
  reportStartup({});
}

/** Polled each frame: the time until loaded, then until the first frame after it, posted with the GPU and the shader programs compiled */
function reportStartup(times: { loadedMs?: number; frames?: number }): void {
  const { created } = window.harness;
  if (viewer.loaded && times.loadedMs === undefined) {
    Object.assign(times, { loadedMs: performance.now() - created, frames: viewer.stats.frames });
  }
  if (times.frames === undefined || viewer.stats.frames <= times.frames) {
    requestAnimationFrame(() => reportStartup(times));
    return;
  }
  const gl = viewer.renderer.getContext();
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const body = {
    loadedMs: times.loadedMs,
    firstFrameMs: performance.now() - created,
    programs: viewer.renderer.info.programs?.length ?? 0,
    gpu: info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "",
    parallelCompile: !!gl.getExtension("KHR_parallel_shader_compile"),
  };
  fetch("/report", { method: "POST", body: JSON.stringify(body) }).catch(() => undefined);
}
