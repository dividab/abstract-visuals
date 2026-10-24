import { AmbientLight, DirectionalLight, PerspectiveCamera, RenderTarget, Scene, WebGLRenderer, WebGLRenderTarget } from "three";
import { WebGPURenderer } from "three/webgpu";
import { buildScene } from "../../../src/renderers/three/build/build.js";
import { compileScene } from "../../../src/renderers/three/compile/compile.js";
import { createGlyphAtlas } from "../../../src/renderers/three/text/text.js";
import { createGroupId, repeatScene, scenes } from "../../scenes.js";

/** Renders a built scene's solids with one renderer, and reports time to ready and CPU time per frame while orbiting */

const params = new URLSearchParams(window.location.search);
const backend = params.get("backend") ?? "webgl";
const source = repeatScene(scenes["systemair3"]!, Number(params.get("copies") ?? "1"));
const canvas = document.getElementById("c") as HTMLCanvasElement;
const start = performance.now();
const renderer =
  backend === "webgl"
    ? new WebGLRenderer({ canvas, antialias: true, alpha: true })
    : new WebGPURenderer({ canvas, antialias: true, alpha: true, forceWebGL: backend === "webgpu-gl" });
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
if (renderer instanceof WebGPURenderer) {
  await renderer.init();
}
const built = buildScene(compileScene(source, createGroupId), {
  structure: { relationsActive: false },
  geometries: new Map(),
  atlas: createGlyphAtlas(),
});
built.parts.forEach((part) => (part.object.visible = part.kind === "solid"));
const scene = new Scene();
scene.add(built.root, new AmbientLight(0xffffff, 0.2));
const lights: ReadonlyArray<readonly [number, number, number, number]> = [
  [-1.9, 1, 0, 3],
  [0, 1, 0.94, 1.2],
  [3.9, 0, 1, 0.3],
];
lights.forEach(([x, y, z, i]) => {
  const light = new DirectionalLight(0xffffff, i);
  light.position.set(x, y, z);
  scene.add(light);
});
const s = source.size_deprecated;
const radius = Math.max(s.x, s.y, s.z) * 1.6;
const camera = new PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, radius / 100, radius * 4);
camera.position.set(0, radius * 0.3, radius);
camera.lookAt(0, 0, 0);
await renderer.compileAsync(scene, camera);
renderer.render(scene, camera);
const readyMs = performance.now() - start;

const times: Array<number> = [];
for (const i of Array.from({ length: 90 }, (_, n) => n)) {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const angle = i / 30;
  camera.position.set(Math.sin(angle) * radius, radius * 0.3, Math.cos(angle) * radius);
  camera.lookAt(0, 0, 0);
  const t = performance.now();
  renderer.render(scene, camera);
  times.push(performance.now() - t);
}
const pixels = await readPixels(renderer, scene, camera);
const drawn = { count: Array.from(pixels).filter((value, i) => i % 4 === 3 && value > 0).length };
const sorted = times.slice(10).sort((a, b) => a - b);
const info = renderer.info.render as unknown as { calls?: number; drawCalls?: number };
const isWebGPU = renderer instanceof WebGPURenderer && (renderer.backend as unknown as { isWebGPUBackend?: boolean }).isWebGPUBackend === true;
Object.assign(window, {
  result: {
    backend: isWebGPU ? "WebGPU" : renderer instanceof WebGPURenderer ? "WebGPURenderer on WebGL2" : "WebGLRenderer",
    readyMs: Math.round(readyMs),
    frameMedianMs: Number(sorted[Math.floor(sorted.length / 2)]!.toFixed(2)),
    frameP90Ms: Number(sorted[Math.floor(sorted.length * 0.9)]!.toFixed(2)),
    drawCalls: info.calls ?? info.drawCalls,
    drawnPixels: drawn.count,
  },
});

/** Rendered into a target and read back, as a WebGPU canvas can't be read after it's presented */
async function readPixels(renderer: WebGLRenderer | WebGPURenderer, scene: Scene, camera: PerspectiveCamera): Promise<ArrayLike<number>> {
  if (renderer instanceof WebGPURenderer) {
    const target = new RenderTarget(256, 144);
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    const pixels = await renderer.readRenderTargetPixelsAsync(target, 0, 0, 256, 144);
    renderer.setRenderTarget(null);
    return pixels;
  }
  const target = new WebGLRenderTarget(256, 144);
  renderer.setRenderTarget(target);
  renderer.render(scene, camera);
  const pixels = new Uint8Array(256 * 144 * 4);
  renderer.readRenderTargetPixels(target, 0, 0, 256, 144, pixels);
  renderer.setRenderTarget(null);
  return pixels;
}
