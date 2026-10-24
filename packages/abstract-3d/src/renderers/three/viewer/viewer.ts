import {
  type BufferGeometry,
  Group,
  NeutralToneMapping,
  OrthographicCamera,
  PerspectiveCamera,
  Raycaster,
  Scene as ThreeScene,
  type Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type { ViewportGizmo } from "three-viewport-gizmo";
import type { StructureState } from "../appearance/appearance.js";
import type { BuiltScene } from "../build/build.js";
import { animateScene, buildScene, cullScene, disposeScene, getPickables, getPickedItem, paintScene } from "../build/build.js";
import type { TextureCache } from "../build/materials.js";
import { disposeTextures } from "../build/materials.js";
import type { Placement } from "../camera/camera.js";
import { fitCamera } from "../camera/camera.js";
import type { Controls } from "../camera/controls.js";
import { configureControls, createControls, setPose } from "../camera/controls.js";
import { createGizmo } from "../camera/gizmo.js";
import type { CompiledScene } from "../compile/compile.js";
import { compileScene } from "../compile/compile.js";
import type { TierGovernor } from "../quality/quality.js";
import { getPixelRatio, recordFrame } from "../quality/quality.js";
import { createKeyLight, disposeKeyLight } from "../shadow/key-light.js";
import type { GroundShadow } from "../shadow/shadow.js";
import { createGroundShadow, disposeGroundShadow } from "../shadow/shadow.js";
import type { GlyphAtlas } from "../text/text.js";
import { createGlyphAtlas } from "../text/text.js";
import type { Change, ViewerOptions } from "./options.js";
import { effects } from "./options.js";
import type { Overlay, OverlayLayer } from "./overlays.js";
import { createOverlayLayer, setOverlays } from "./overlays.js";

/**
 * The interactive viewer: renderer, render on demand, camera, controls, pointer input, overlays and gizmo. Updates are batched into the next frame,
 * as r3f applies props; render on demand and `invalidate` are r3f's `frameloop="demand"`; the state with functions instead of a class keeps it free
 * of `this`
 */

type Hit = { readonly item: number; readonly target: number; readonly point: Vector3 };

export type Viewer<Content> = {
  options: ViewerOptions<Content>;
  readonly container: HTMLElement;
  readonly canvas: HTMLCanvasElement;
  readonly renderer: WebGLRenderer;
  /** Apps can add their own objects, then `invalidate` */
  readonly scene: ThreeScene;
  readonly lights: Group;
  readonly cameras: { readonly Perspective: PerspectiveCamera; readonly Orthographic: OrthographicCamera };
  camera: PerspectiveCamera | OrthographicCamera;
  readonly controls: Controls;
  readonly geometries: Map<string, BufferGeometry>;
  readonly atlas: GlyphAtlas;
  readonly textures: TextureCache;
  readonly overlays: OverlayLayer<Content>;
  readonly size: { width: number; height: number };
  readonly listeners: AbortController;
  readonly resizeObserver: ResizeObserver;
  readonly pointer: { last?: PointerEvent; down?: { readonly x: number; readonly y: number }; hovered?: Hit; frame: number };
  readonly loop: { frame: number; last: number; wasMoving: boolean; seconds: number };
  /** What the next frame redoes, from the options passed since the last */
  readonly pending: Set<Change>;
  /** CPU times in ms of the last frame, pick and repaint, and the last frame's draw calls, post-processing included */
  readonly stats: { frames: number; frameMs: number; drawCalls: number; pickMs: number; paintMs: number };
  structure: StructureState;
  compiled?: CompiledScene;
  built?: BuiltScene;
  gizmo?: ViewportGizmo;
  shadow?: GroundShadow;
  /** The key light that casts the solids' shadows on themselves */
  keyLight?: Group;
  governor?: TierGovernor;
  /** The studio environment, loading and once loaded */
  readonly studio: { loading?: Promise<unknown>; texture?: Texture };
  /** The scene is built and its shaders compiled */
  loaded: boolean;
  fitted: boolean;
  disposed: boolean;
};

/** Pointer travel in CSS pixels below which a press and release is a click, not a drag */
const clickTolerance = 4;

export function createViewer<Content>(container: HTMLElement, options: ViewerOptions<Content>): Viewer<Content> {
  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }
  const canvas = document.createElement("canvas");
  // Absolutely positioned, so the canvas' own size never feeds back into the container's
  canvas.style.cssText = "position:absolute;inset:0;display:block;width:100%;height:100%;touch-action:none";
  container.prepend(canvas);
  // Khronos PBR Neutral tone mapping keeps product colors true; the canvas is transparent, as r3f's
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  Object.assign(renderer, { toneMapping: NeutralToneMapping });
  renderer.setClearColor(0x000000, 0);
  // Rendered when the scene is built, not each frame
  Object.assign(renderer.shadowMap, { enabled: true, autoUpdate: false });
  renderer.info.autoReset = false;
  const cameras = { Perspective: new PerspectiveCamera(45), Orthographic: new OrthographicCamera() };
  const camera = cameras[options.camera?.type ?? "Perspective"];
  const v: Viewer<Content> = {
    options,
    container,
    canvas,
    renderer,
    scene: new ThreeScene(),
    lights: new Group(),
    cameras,
    camera,
    controls: createControls(camera, canvas, options.controls ?? {}, () => invalidate(v)),
    geometries: new Map(),
    atlas: createGlyphAtlas(),
    textures: new Map(),
    overlays: createOverlayLayer(container),
    size: { width: 0, height: 0 },
    listeners: new AbortController(),
    resizeObserver: new ResizeObserver(([entry]) => entry && onResize(v, entry.contentRect)),
    pointer: { frame: 0 },
    loop: { frame: 0, last: 0, wasMoving: false, seconds: 0 },
    pending: new Set(["compile", "build", "camera", "controls", "gizmo", "lights", "quality", "paint", "overlays"]),
    stats: { frames: 0, frameMs: 0, drawCalls: 0, pickMs: 0, paintMs: 0 },
    structure: { activeComponents: options.activeComponents, relationsActive: options.activeRelations !== undefined },
    studio: {},
    loaded: false,
    fitted: false,
    disposed: false,
  };
  v.scene.add(v.lights);
  const signal = { signal: v.listeners.signal };
  canvas.addEventListener("pointermove", (e) => onPointerMove(v, e), signal);
  canvas.addEventListener("pointerleave", (e) => setHovered(v, undefined, e), signal);
  canvas.addEventListener("pointerdown", (e) => (v.pointer.down = { x: e.clientX, y: e.clientY }), signal);
  canvas.addEventListener("click", (e) => onClick(v, e), signal);
  canvas.addEventListener("contextmenu", (e) => onContextMenu(v, e), signal);
  v.resizeObserver.observe(container);
  return v;
}

/** Sets the options passed, redone in the next frame; what each redoes is in `effects`, so pass only the ones that changed */
export function updateViewer<Content>(v: Viewer<Content>, options: Partial<ViewerOptions<Content>>): void {
  v.options = { ...v.options, ...options };
  Object.keys(options).forEach((key) => effects[key as keyof ViewerOptions<Content>].forEach((change) => v.pending.add(change)));
  invalidate(v);
}

/** Renders a frame on the next animation frame, e.g. after changing objects added to `scene` */
export function invalidate<Content>(v: Viewer<Content>): void {
  if (!v.loop.frame && !v.disposed && v.size.width > 0 && v.size.height > 0) {
    v.loop.frame = requestAnimationFrame((now) => renderFrame(v, now));
  }
}

export function disposeViewer<Content>(v: Viewer<Content>): void {
  v.disposed = true;
  cancelAnimationFrame(v.loop.frame);
  cancelAnimationFrame(v.pointer.frame);
  v.listeners.abort();
  v.resizeObserver.disconnect();
  v.controls.orbit.dispose();
  v.gizmo?.dispose();
  if (v.built) {
    disposeScene(v.built);
  }
  if (v.shadow) {
    disposeGroundShadow(v.shadow);
  }
  if (v.keyLight) {
    disposeKeyLight(v.keyLight);
  }
  v.studio.texture?.dispose();
  v.geometries.forEach((g) => g.dispose());
  v.atlas.texture.dispose();
  disposeTextures(v.textures);
  setOverlays(v.overlays, [], v.options.onOverlays);
  v.overlays.renderer.domElement.remove();
  v.renderer.dispose();
  v.canvas.remove();
}

/** Redoes what the changes need, in dependency order */
function apply<Content>(v: Viewer<Content>, changes: ReadonlySet<Change>): void {
  const { options } = v;
  if (changes.has("compile")) {
    v.compiled = options.scene && compileScene(options.scene, options.createGroupId);
    v.pointer.hovered = undefined;
  }
  if (changes.has("build")) {
    v.structure = { activeComponents: options.activeComponents, relationsActive: options.activeRelations !== undefined };
    rebuild(v);
  }
  if (changes.has("shadow") || changes.has("build")) {
    if (v.shadow) {
      disposeGroundShadow(v.shadow);
    }
    v.shadow = v.built && options.groundShadow !== false ? createGroundShadow(v.renderer, v.scene, v.built) : undefined;
    if (v.keyLight) {
      disposeKeyLight(v.keyLight);
    }
    v.keyLight = v.built ? createKeyLight(v.built, options.shadows !== false) : undefined;
    if (v.keyLight) {
      v.scene.add(v.keyLight);
    }
    // The shadow map is rendered once, as the scene doesn't move, or each frame while something animates
    Object.assign(v.renderer.shadowMap, { needsUpdate: true, autoUpdate: !!v.built && v.built.animatedItems.length > 0 });
  }
  if (changes.has("camera")) {
    const { near = 0.1, far = 2000, ...rest } = options.camera ?? { type: "Perspective" };
    v.camera = v.cameras[rest.type];
    Object.assign(v.camera, { near, far, ...(rest.type === "Perspective" ? { fov: rest.fov ?? 45 } : {}) });
    v.controls.orbit.object = v.camera;
  }
  if (changes.has("controls")) {
    configureControls(v.controls, options.controls ?? {});
  }
  // As the r3f renderer, the scene is fitted at first, and for a new camera or canvas aspect
  if ((changes.has("build") && !v.fitted) || changes.has("camera")) {
    fitPose(v);
  }
  if (changes.has("gizmo") || changes.has("camera")) {
    updateGizmo(v);
  }
  if (changes.has("lights")) {
    updateLights(v);
  }
  if (changes.has("quality")) {
    const quality = options.quality ?? "high";
    v.governor = { quality, tier: quality === "auto" ? "high" : quality, sum: 0, count: 0 };
    v.renderer.setPixelRatio(getPixelRatio(v.governor.tier, window.devicePixelRatio));
  }
  if ((changes.has("paint") || changes.has("build")) && v.built) {
    const start = performance.now();
    paintScene(v.built, {
      ...v.structure,
      selectedIds: options.selectedIds,
      hoveredIds: new Set(options.hoveredIds),
      hoveredTarget: v.pointer.hovered?.target,
      dimensionsClickable: options.onClickGroup !== undefined,
    });
    v.stats.paintMs = performance.now() - start;
  }
  if (changes.has("dimensions") && v.built) {
    v.built.dimensions.visible = options.showDimensions ?? true;
  }
  if (changes.has("overlays") || changes.has("build")) {
    updateOverlays(v);
  }
}

function rebuild<Content>(v: Viewer<Content>): void {
  if (v.built) {
    disposeScene(v.built);
  }
  const { options, compiled } = v;
  v.built =
    compiled &&
    buildScene(compiled, {
      ...options,
      structure: v.structure,
      geometries: v.geometries,
      atlas: v.atlas,
      textures: v.textures,
      onTextureLoaded: () => invalidate(v),
    });
  if (v.built) {
    v.scene.add(v.built.root);
    v.built.dimensions.visible = options.showDimensions ?? true;
    // Compiled in parallel where the driver can, as three.js's compileAsync example, and after the studio arrived, which they use
    loadStudio(v)
      .catch(() => undefined)
      .then(() => v.renderer.compileAsync(v.scene, v.camera))
      .then(() => onLoaded(v))
      .catch(() => undefined);
  }
}

function onLoaded<Content>(v: Viewer<Content>): void {
  if (!v.disposed) {
    v.loaded = true;
    v.options.onLoad?.();
    invalidate(v);
  }
}

function renderFrame<Content>(v: Viewer<Content>, now: number): void {
  const { loop, renderer } = v;
  const start = performance.now();
  const interval = loop.last ? now - loop.last : 0;
  loop.frame = 0;
  loop.last = now;
  if (v.pending.size > 0) {
    apply(v, new Set(v.pending));
    v.pending.clear();
  }
  const { built, camera, gizmo } = v;
  renderer.info.reset();
  const moving = v.controls.orbit.update(Math.min(interval / 1000, 0.1)) || !!gizmo?.animating;
  if (moving && loop.wasMoving && v.governor && recordFrame(v.governor, interval)) {
    renderer.setPixelRatio(getPixelRatio(v.governor.tier, window.devicePixelRatio));
  }
  loop.wasMoving = moving;
  const animated = !!built && built.animatedItems.length > 0;
  if (animated) {
    loop.seconds += Math.min(interval / 1000, 0.1);
    animateScene(built, loop.seconds);
  }
  camera.updateMatrixWorld();
  if (built) {
    cullScene(built, camera.position);
  }
  if (v.loaded) {
    renderer.render(v.scene, camera);
  }
  gizmo?.render();
  v.overlays.renderer.render(v.overlays.scene, camera);
  Object.assign(v.stats, { frames: v.stats.frames + 1, frameMs: performance.now() - start, drawCalls: renderer.info.render.calls });
  if (moving || animated) {
    invalidate(v);
  } else {
    loop.last = 0;
  }
}

/** As the r3f renderer, a resize refits only when the canvas' aspect changes */
function onResize<Content>(v: Viewer<Content>, rect: DOMRectReadOnly): void {
  const aspectChanged = rect.width / rect.height !== v.size.width / v.size.height;
  Object.assign(v.size, { width: rect.width, height: rect.height });
  v.renderer.setSize(rect.width, rect.height, false);
  v.overlays.renderer.setSize(rect.width, rect.height);
  v.gizmo?.update();
  if (aspectChanged) {
    fitPose(v);
  }
  // Resizing cleared the canvas; rendered now, before the browser paints, instead of the next frame, so it never shows blank
  if (v.loop.frame) {
    cancelAnimationFrame(v.loop.frame);
    v.loop.frame = 0;
  }
  if (rect.width > 0 && rect.height > 0 && !v.disposed) {
    renderFrame(v, performance.now());
  }
}

/** Fits the projection to the scene, and moves the camera to look from the view; as the r3f renderer, the target stays where it was panned to */
function fitPose<Content>(v: Viewer<Content>): void {
  const placement = fitScene(v);
  if (placement) {
    const { x, y, z } = placement.direction;
    setPose(v.controls, new Vector3(x, y, z).multiplyScalar(placement.distance), v.controls.orbit.target);
    v.fitted = true;
  }
}

function fitScene<Content>(v: Viewer<Content>): Placement | undefined {
  const { scene, view = "front", bufferZones = {}, fitPadding = 0 } = v.options;
  return scene && fitCamera(v.camera, { view, size: scene.size_deprecated, canvas: v.size, bufferZones, fitPadding });
}

function updateGizmo<Content>(v: Viewer<Content>): void {
  v.gizmo?.dispose();
  const { gizmo } = v.options;
  v.gizmo = gizmo && createGizmo(v.camera, v.renderer, v.container, gizmo).attachControls(v.controls.orbit);
  v.gizmo?.addEventListener("change", () => invalidate(v));
  v.gizmo?.addEventListener("start", () => onGizmoStart(v));
  // Its labels are drawn once, so ones drawn before the page's web fonts loaded are redrawn when they have
  const created = v.gizmo;
  if (created && document.fonts.status !== "loaded") {
    document.fonts.ready.then(() => redrawGizmo(v, created)).catch(() => undefined);
  }
}

/** Unless the gizmo was replaced or the viewer disposed meanwhile */
function redrawGizmo<Content>(v: Viewer<Content>, gizmo: ViewportGizmo): void {
  if (v.gizmo === gizmo && !v.disposed) {
    gizmo.set(gizmo.options);
    invalidate(v);
  }
}

/**
 * A click turns the camera, which can also move the target back to the scene's center and fit the scene. The gizmo turns around its target at the
 * distance it read when pressed, its internal `_distance`, so that's set to the fitted one
 */
function onGizmoStart<Content>(v: Viewer<Content>): void {
  const { gizmo } = v.options;
  const reset = gizmo?.type === "Viewcube" ? gizmo.viewcubeProps?.resetZoomAndPanOnClick : gizmo?.viewportProps?.resetZoomAndPanOnClick;
  const placement = v.gizmo?.animating && reset ? fitScene(v) : undefined;
  if (placement) {
    v.controls.orbit.target.set(0, 0, 0);
    Object.assign(v.gizmo!, { _distance: placement.distance });
  }
}

function onPointerMove<Content>(v: Viewer<Content>, event: PointerEvent): void {
  v.pointer.last = event;
  v.pointer.frame ||= requestAnimationFrame(() => hoverAtPointer(v));
}

/** One pick per frame at most, paused while the camera is dragged, as the r3f renderer's ControlsWrapper paused pointer events */
function hoverAtPointer<Content>(v: Viewer<Content>): void {
  v.pointer.frame = 0;
  if (v.pointer.last && !v.controls.drag.moved) {
    setHovered(v, pick(v, v.pointer.last), v.pointer.last);
  }
}

function onClick<Content>(v: Viewer<Content>, event: MouseEvent): void {
  const { down } = v.pointer;
  const clicked = !!down && Math.hypot(event.clientX - down.x, event.clientY - down.y) <= clickTolerance;
  const hit = clicked ? pick(v, event) : undefined;
  const target = hit && v.compiled!.targets[hit.target];
  const args = hit && getGroupArgs(v, hit);
  if (hit && target?.kind === "relation") {
    v.options.onClickRelation?.(target.relation, { nativeEvent: event, point: hit.point });
  } else if (hit && args) {
    v.options.onClickGroup?.(...args, { nativeEvent: event, point: hit.point });
  } else if (clicked) {
    v.options.onPointerMissed?.(event);
  }
}

function onContextMenu<Content>(v: Viewer<Content>, event: MouseEvent): void {
  const hit = pick(v, event);
  const args = hit && getGroupArgs(v, hit);
  if (hit && args) {
    v.options.onContextMenuGroup?.(...args, event.x, event.y, { nativeEvent: event, point: hit.point });
  }
}

function setHovered<Content>(v: Viewer<Content>, hit: Hit | undefined, event: PointerEvent): void {
  const previous = v.pointer.hovered;
  v.pointer.hovered = hit;
  v.canvas.style.cursor = hit ? "pointer" : "";
  if (hit?.target === previous?.target) {
    return;
  }
  if (previous && getGroupArgs(v, previous)) {
    v.options.onHoverGroup?.(undefined, undefined, undefined, { nativeEvent: event, point: previous.point });
  }
  const args = hit && getGroupArgs(v, hit);
  if (hit && args) {
    v.options.onHoverGroup?.(...args, { nativeEvent: event, point: hit.point });
  }
  v.pending.add("paint").add("overlays");
  invalidate(v);
}

/** The first interactive item under the pointer: groups with an id that aren't disabled, clickable dimensions and active relations */
function pick<Content>(v: Viewer<Content>, event: MouseEvent): Hit | undefined {
  const { built } = v;
  if (!built) {
    return undefined;
  }
  const start = performance.now();
  const rect = v.canvas.getBoundingClientRect();
  raycaster.setFromCamera(ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1), v.camera);
  const hits = raycaster.intersectObjects(getPickables(built), false);
  v.stats.pickMs = performance.now() - start;
  for (const hit of hits) {
    const item = getPickedItem(built, hit);
    const target = item === undefined ? undefined : built.compiled.items[item]!.target;
    const kind = target === undefined ? undefined : built.compiled.targets[target]!;
    const interactive =
      kind?.kind === "group"
        ? kind.id !== "" && !built.targetStates[target!]!.disabled
        : kind?.kind === "dimension"
          ? kind.id !== undefined && v.options.activeRelations === undefined && v.options.onClickGroup !== undefined
          : kind !== undefined;
    if (interactive) {
      return { item: item!, target: target!, point: hit.point.clone() };
    }
  }
  return undefined;
}

/** The id, top-level group's data and the hit mesh's group's data of a group or dimension hit */
function getGroupArgs<Content>(
  v: Viewer<Content>,
  hit: Hit
): readonly [string, Record<string, string> | undefined, Record<string, string> | undefined] | undefined {
  const target = v.compiled!.targets[hit.target]!;
  switch (target.kind) {
    case "group":
      return [target.id, target.rootData, v.compiled!.items[hit.item]!.data];
    case "dimension":
      return [target.id!, undefined, undefined];
    default:
      return undefined;
  }
}

/** The scene is lit by a photographed studio as its environment; apps can add their own lights */
function updateLights<Content>(v: Viewer<Content>): void {
  const { scene, lights, environmentIntensity = studioIntensity } = v.options;
  v.lights.clear();
  (typeof lights === "function" ? (scene ? lights(scene) : []) : (lights ?? [])).forEach((o) => v.lights.add(o));
  v.scene.environmentIntensity = environmentIntensity;
  loadStudio(v).catch(() => undefined);
}

/** The studio, loaded once, its own chunk; set when it arrives, so the scene's shaders are compiled after it, with it */
function loadStudio<Content>(v: Viewer<Content>): Promise<unknown> {
  v.studio.loading ??= import("../environment/studio.js")
    .then(({ loadStudio: load }) => load())
    .then((texture) => {
      v.studio.texture = texture;
      v.scene.environment = texture;
      invalidate(v);
      return texture;
    });
  return v.studio.loading;
}

function updateOverlays<Content>(v: Viewer<Content>): void {
  const { compiled, options } = v;
  const target = v.pointer.hovered && compiled?.targets[v.pointer.hovered.target];
  const overlays: Array<Overlay<Content>> = [];
  options.popovers?.forEach(
    (p) =>
      compiled &&
      overlays.push({ key: `popover:${p.id}`, position: new Vector3(p.pos.x, p.pos.y, p.pos.z).applyMatrix4(compiled.matrix), content: p.content })
  );
  if (target?.kind === "group") {
    options.getTooltips?.(target.id).forEach((p) =>
      overlays.push({
        key: `tooltip:${p.id}`,
        position: new Vector3(p.pos.x, p.pos.y, p.pos.z).applyMatrix4(compiled!.roots[target.root]!),
        content: p.content,
      })
    );
  }
  setOverlays(v.overlays, overlays, options.onOverlays);
}

/** The studio's share of the light, the key light giving the rest, so the key light's shadows show */
const studioIntensity = 0.5;

const raycaster = new Raycaster();
const ndc = new Vector2();
