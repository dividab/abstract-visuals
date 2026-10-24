import type { View } from "../../src/abstract-3d.js";
import type { CameraOptions, Quality, ViewerOptions } from "../../src/renderers/three/index.js";
import { createViewer, updateViewer } from "../../src/renderers/three/index.js";
import { createGroupId, repeatScene, scenes } from "../scenes.js";

/** A viewer configured by the URL, driven by run.ts through `window.harness` */

const params = new URLSearchParams(window.location.search);
const scene = repeatScene(scenes[params.get("scene") ?? "systemair3"]!, Number(params.get("copies") ?? "1"));
const options: ViewerOptions<string> = {
  scene,
  createGroupId,
  camera: { type: params.get("camera") ?? "Perspective", near: 100, far: 200000 } as CameraOptions,
  view: (params.get("view") ?? "front") as View,
  quality: (params.get("quality") ?? "medium") as Quality,
  gizmo: params.get("gizmo") === "axes" ? { type: "Viewport" } : { type: "Viewcube" },
  onClickGroup: (id) => updateViewer(viewer, { selectedIds: { [id]: true } }),
  getTooltips: (id) => [{ id, pos: { x: 0, y: 0, z: 0 }, content: id.slice(0, 8) }],
};
const viewer = createViewer(document.getElementById("app")!, options);

declare global {
  interface Window {
    harness: { readonly viewer: typeof viewer; readonly created: number };
  }
}
window.harness = { viewer, created: performance.now() };
