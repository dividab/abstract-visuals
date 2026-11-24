import {
  Box3,
  type BufferGeometry,
  DirectionalLight,
  Euler,
  Group,
  HemisphereLight,
  Matrix4,
  NeutralToneMapping,
  OrthographicCamera,
  PerspectiveCamera,
  Plane,
  Quaternion,
  Raycaster,
  Scene as ThreeScene,
  Vector2,
  Vector3,
  WebGLRenderer,
  type WebGLRenderTarget,
} from "three";
import type { ViewportGizmo } from "three-viewport-gizmo";
import type { Vec3, View } from "../../../abstract-3d.js";
import { bounds3ToSize } from "../../../abstract-3d.js";
import type { StructureState } from "../appearance/appearance.js";
import type { BuiltScene } from "../build/build.js";
import {
  animateScene,
  buildScene,
  cullScene,
  disposeScene,
  getPickables,
  getPickedItem,
  getSolidsBox,
  moveTarget,
  paintScene,
} from "../build/build.js";
import type { TextureCache } from "../build/materials.js";
import { disposeTextures } from "../build/materials.js";
import type { Placement } from "../camera/camera.js";
import { fitCamera } from "../camera/camera.js";
import type { Controls } from "../camera/controls.js";
import { configureControls, createControls, setPose } from "../camera/controls.js";
import { createGizmo, disposeGizmo } from "../camera/gizmo.js";
import type { CompiledScene } from "../compile/compile.js";
import { compileScene } from "../compile/compile.js";
import { getHotspotHit, placeHotspots } from "../hotspots/hotspots.js";
import type { TierGovernor } from "../quality/quality.js";
import { getPixelRatio, recordFrame } from "../quality/quality.js";
import { createKeyLight, disposeKeyLight } from "../shadow/key-light.js";
import type { GroundShadow } from "../shadow/shadow.js";
import { createGroundShadow, disposeGroundShadow } from "../shadow/shadow.js";
import type { GlyphAtlas } from "../text/text.js";
import { createGlyphAtlas } from "../text/text.js";
import type { Change, DropTarget, ViewerOptions } from "./options.js";
import { effects } from "./options.js";
import type { Overlay, OverlayLayer } from "./overlays.js";
import { createOverlayLayer, setOverlays } from "./overlays.js";

/**
 * The interactive viewer: renderer, render on demand, camera, controls, pointer input, overlays and gizmo. Updates are batched into the next frame,
 * as r3f applies props; render on demand and `invalidate` are r3f's `frameloop="demand"`; the state with functions instead of a class keeps it free
 * of `this`
 */

type Hit = { readonly item: number; readonly target: number; readonly point: Vector3 };

/** A group's id, top-level group's data and hit mesh's group's data, as its events pass them */
type GroupArgs = readonly [string, Record<string, string> | undefined, Record<string, string> | undefined];

/**
 * The draggable top-level group pressed, from its press until its release, and whether the pointer moved past a click since, which started its drag:
 * its target, the point pressed, how far a drop had moved it from where it's built when pressed, the world box of its solids where it's built, and
 * how far it's moved
 */
type Drag = {
  readonly pointerId: number;
  readonly args: GroupArgs;
  readonly target: number;
  readonly point: Vector3;
  readonly base: Vector3;
  readonly box: Box3;
  readonly offset: Vector3;
  started: boolean;
};

/** Where the camera looks from: it looks at the target from the distance, turned by the quaternion */
type Pose = { readonly quaternion: Quaternion; readonly target: Vector3; readonly distance: number; readonly zoom: number };

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
  readonly pointer: {
    last?: PointerEvent;
    down?: { readonly x: number; readonly y: number };
    /** The pointer pressed in the viewer, e.g. on the canvas or the gizmo, until its release, whose release isn't an external drop */
    pressed?: number;
    hovered?: Hit;
    frame: number;
    drag?: Drag;
    /** The top-level group dropped on a target, kept where it was dropped until a new scene, which places it as the drop changed it */
    dropped?: { readonly target: number; readonly offset: Vector3 };
  };
  readonly loop: { frame: number; last: number; wasMoving: boolean; seconds: number };
  /** What the next frame redoes, from the options passed since the last */
  readonly pending: Set<Change>;
  /** CPU times in ms of the last frame, pick and repaint, and the last frame's draw calls, post-processing included */
  readonly stats: { frames: number; frameMs: number; drawCalls: number; pickMs: number; paintMs: number };
  structure: StructureState;
  compiled?: CompiledScene;
  built?: BuiltScene;
  /** The previous build and ground shadow, out of the scene, disposed once the next frame has given their shader programs to the new ones */
  readonly retired: { built?: BuiltScene; shadow?: GroundShadow };
  gizmo?: ViewportGizmo;
  /** A gizmo click's turn of the camera, from when it was clicked; where it ends is known once the gizmo moved the camera there */
  turn?: { readonly from: Pose; readonly to?: Pose; readonly start: number };
  shadow?: GroundShadow;
  /** The key light that casts the solids' shadows on themselves */
  keyLight?: Group;
  governor?: TierGovernor;
  /** The studio environment, loading and once loaded */
  readonly studio: { loading?: Promise<unknown>; target?: WebGLRenderTarget };
  /** The scene is built and its shaders compiled */
  loaded: boolean;
  fitted: boolean;
  disposed: boolean;
};

/** Pointer travel in CSS pixels below which a press and release is a click, not a drag */
const clickTolerance = 4;
/** How long a gizmo click's turn of the camera takes */
const turnMs = 400;

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
    retired: {},
    loaded: false,
    fitted: false,
    disposed: false,
  };
  v.scene.add(v.lights);
  // Loaded while the first frame builds the scene
  if (options.studio !== false) {
    loadStudio(v).catch(() => undefined);
  }
  const signal = { signal: v.listeners.signal };
  canvas.addEventListener("pointermove", (e) => onPointerMove(v, e), signal);
  canvas.addEventListener("pointerleave", (e) => setHovered(v, undefined, e), signal);
  // On the container while capturing, so before the controls' own on the canvas, which a press on a draggable group disables
  container.addEventListener("pointerdown", (e) => onPointerDown(v, e), { ...signal, capture: true });
  canvas.addEventListener("pointerup", (e) => onPointerUp(v, e), signal);
  canvas.addEventListener("pointercancel", (e) => onPointerUp(v, e), signal);
  canvas.addEventListener("click", (e) => onClick(v, e), signal);
  canvas.addEventListener("contextmenu", (e) => onContextMenu(v, e), signal);
  window.addEventListener("keydown", (e) => onKeyDown(v, e), signal);
  // After the canvas' own, also for a release off it
  window.addEventListener("pointerup", () => (v.pointer.pressed = undefined), signal);
  window.addEventListener("pointercancel", () => (v.pointer.pressed = undefined), signal);
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

/**
 * Turns the camera to look from the view at the scene's center, and fits the scene inside the buffer zones, as a viewcube click that resets zoom and
 * pan; the view is kept for later fits, e.g. for a new canvas aspect
 */
export function fitView<Content>(v: Viewer<Content>, view: View | Vec3): void {
  v.options = { ...v.options, view };
  v.controls.orbit.target.set(0, 0, 0);
  fitPose(v);
  invalidate(v);
}

export function disposeViewer<Content>(v: Viewer<Content>): void {
  v.disposed = true;
  cancelAnimationFrame(v.loop.frame);
  cancelAnimationFrame(v.pointer.frame);
  v.listeners.abort();
  v.resizeObserver.disconnect();
  v.controls.orbit.dispose();
  if (v.gizmo) {
    disposeGizmo(v.gizmo);
  }
  disposeRetired(v);
  if (v.built) {
    disposeScene(v.built);
  }
  if (v.shadow) {
    disposeGroundShadow(v.shadow);
  }
  if (v.keyLight) {
    disposeKeyLight(v.keyLight);
  }
  v.studio.target?.dispose();
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
    v.pointer.dropped = undefined;
  }
  if (changes.has("build")) {
    v.structure = {
      activeComponents: options.activeComponents,
      relationsActive: options.activeRelations !== undefined,
      draggedTarget: v.pointer.drag?.started ? v.pointer.drag.target : v.pointer.dropped?.target,
    };
    rebuild(v);
  }
  if (changes.has("shadow") || changes.has("build")) {
    if (v.retired.shadow) {
      disposeGroundShadow(v.retired.shadow);
    }
    v.retired.shadow = v.shadow;
    v.shadow?.mesh.removeFromParent();
    v.shadow?.floor.removeFromParent();
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
  if (v.retired.built) {
    disposeScene(v.retired.built);
  }
  v.retired.built = v.built;
  v.built?.root.removeFromParent();
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
    (options.studio === false ? Promise.resolve() : loadStudio(v))
      .catch(() => undefined)
      .then(() => v.renderer.compileAsync(v.scene, v.camera))
      .then(() => onLoaded(v))
      .catch(() => undefined);
  }
}

/** Three deletes a shader program once no material uses it, so the previous build's are disposed after the new build's took the programs over */
function disposeRetired<Content>(v: Viewer<Content>): void {
  if (v.retired.built) {
    disposeScene(v.retired.built);
  }
  if (v.retired.shadow) {
    disposeGroundShadow(v.retired.shadow);
  }
  Object.assign(v.retired, { built: undefined, shadow: undefined });
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
  if (v.turn?.to) {
    turnCamera(v, v.turn.from, v.turn.to, (now - v.turn.start) / turnMs);
  }
  // Not during a turn, as the controls would look at the target with the world's up instead of the turn's roll, which spins the camera near the
  // top and bottom views and snaps it at their end
  const moving = !!v.turn || v.controls.orbit.update(Math.min(interval / 1000, 0.1));
  if (moving && loop.wasMoving && v.governor && recordFrame(v.governor, interval)) {
    renderer.setPixelRatio(getPixelRatio(v.governor.tier, window.devicePixelRatio));
  }
  loop.wasMoving = moving;
  const animated = !!built && built.animatedItems.length > 0;
  if (animated) {
    loop.seconds += Math.min(interval / 1000, 0.1);
    animateScene(built, loop.seconds);
  }
  // After animating, which places the animated items where they're built
  const { drag, dropped } = v.pointer;
  if (built && drag?.started) {
    moveTarget(built, drag.target, drag.offset, loop.seconds);
  } else if (built && dropped) {
    moveTarget(built, dropped.target, dropped.offset, loop.seconds);
  }
  camera.updateMatrixWorld();
  if (built) {
    cullScene(built, camera.position);
    placeHotspots(built.hotspots, camera);
  }
  if (v.loaded) {
    // Floors the viewport to the canvas each frame, as the gizmo restores it rounded, a pixel larger at a fractional pixel ratio
    renderer.setRenderTarget(null);
    renderer.render(v.scene, camera);
    disposeRetired(v);
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

function fitScene<Content>(
  v: Viewer<Content>,
  view: View | Quaternion = getOrientation(v.options.view ?? "front", v.camera.up)
): Placement | undefined {
  const { scene, bufferZones = {}, fitPadding = 0 } = v.options;
  return scene && fitCamera(v.camera, { view, size: bounds3ToSize(scene.bounds), canvas: v.size, bufferZones, fitPadding });
}

/** A view, or for a rotation of the scene the camera's orientation that shows it so, upright as the controls keep it */
function getOrientation(view: View | Vec3, up: Vector3): View | Quaternion {
  if (typeof view === "string") {
    return view;
  }
  const direction = new Vector3(0, 0, 1).applyQuaternion(new Quaternion().setFromEuler(new Euler(view.x, view.y, view.z)).invert());
  return new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(direction, new Vector3(), up));
}

function updateGizmo<Content>(v: Viewer<Content>, fontsLoaded = false): void {
  if (v.gizmo) {
    disposeGizmo(v.gizmo);
  }
  // A click's turn that the old gizmo hadn't moved the camera to the end of would never end
  if (v.turn && !v.turn.to) {
    endTurn(v);
  }
  const { gizmo } = v.options;
  v.gizmo = gizmo && createGizmo(v.camera, v.renderer, v.container, gizmo, () => invalidate(v)).attachControls(v.controls.orbit);
  v.gizmo?.addEventListener("change", () => onGizmoChange(v));
  v.gizmo?.addEventListener("start", () => onGizmoStart(v));
  v.gizmo?.addEventListener("end", () => onGizmoEnd(v));
  // Its labels are drawn into its textures once, so ones drawn before their web font loaded are replaced by a new one once it has, unless replaced
  // or disposed meanwhile; loading starts it if nothing has, and gives no faces for a system font or one that failed. Only once, so a font that
  // never checks as loaded can't replace it again and again. Not by its set(options), which leaves it detached from the controls and keeps every
  // other old label
  const created = v.gizmo;
  const font = created && `${created.options.font?.weight ?? ""} 16px ${created.options.font?.family ?? "sans-serif"}`;
  if (created && font && !fontsLoaded && !document.fonts.check(font)) {
    document.fonts
      .load(font)
      .then((faces) => faces.length > 0 && v.gizmo === created && !v.disposed && replaceGizmo(v))
      .catch(() => undefined);
  }
}

function replaceGizmo<Content>(v: Viewer<Content>): void {
  updateGizmo(v, true);
  invalidate(v);
}

/** A click starts a turn, from where a turn going on has got to */
function onGizmoStart<Content>(v: Viewer<Content>): void {
  if (v.gizmo?.animating) {
    v.turn = { from: getPose(v), start: performance.now() };
  }
}

/** Dragging the gizmo stops a turn going on; a click's changes come while it's animating, or before the turn knows where it ends */
function onGizmoChange<Content>(v: Viewer<Content>): void {
  if (!v.gizmo?.animating && v.turn?.to) {
    v.turn = undefined;
  }
  invalidate(v);
}

/**
 * The gizmo, not animated, moved the camera to the clicked view at once; it's moved back, to turn from there in the next frames, eased, and with the
 * target and distance too, as a click can also move the target back to the scene's center and fit the scene to the view. An orthographic camera's
 * zoom starts at the one that shows as much on the fitted projection as before
 */
function onGizmoEnd<Content>(v: Viewer<Content>): void {
  const { turn, camera } = v;
  if (turn && !turn.to) {
    const { gizmo } = v.options;
    const reset = gizmo?.type === "Viewcube" ? gizmo.viewcubeProps?.resetZoomAndPanOnClick : gizmo?.viewportProps?.resetZoomAndPanOnClick;
    const quaternion = camera.quaternion.clone();
    const height = (): number => ("isOrthographicCamera" in camera ? camera.top - camera.bottom : 1);
    const before = height();
    const placement = reset ? fitScene(v, quaternion) : undefined;
    const from = { ...turn.from, zoom: (turn.from.zoom * height()) / before };
    const to = placement ? { quaternion, target: new Vector3(), distance: placement.distance, zoom: 1 } : { ...turn.from, quaternion };
    v.turn = { ...turn, from, to };
    setCameraPose(v, from);
  }
  // Its end, also of a press during a turn, enabled the controls, which the turn enables when it ends
  if (v.turn) {
    v.controls.orbit.enabled = false;
  }
}

function turnCamera<Content>(v: Viewer<Content>, from: Pose, to: Pose, progress: number): void {
  const t = Math.min(1, progress);
  const eased = t * t * (3 - 2 * t);
  const lerp = (a: number, b: number): number => a + (b - a) * eased;
  setCameraPose(v, {
    quaternion: from.quaternion.clone().slerp(to.quaternion, eased),
    target: from.target.clone().lerp(to.target, eased),
    distance: lerp(from.distance, to.distance),
    zoom: lerp(from.zoom, to.zoom),
  });
  if (t === 1) {
    endTurn(v);
  }
}

/** The controls the click disabled are enabled again */
function endTurn<Content>(v: Viewer<Content>): void {
  v.turn = undefined;
  v.controls.orbit.enabled = v.controls.current.options.enabled ?? true;
}

function getPose<Content>({ camera, controls }: Viewer<Content>): Pose {
  const target = controls.orbit.target.clone();
  return { quaternion: camera.quaternion.clone(), target, distance: camera.position.distanceTo(target), zoom: camera.zoom };
}

function setCameraPose<Content>(v: Viewer<Content>, { quaternion, target, distance, zoom }: Pose): void {
  const { camera } = v;
  camera.quaternion.copy(quaternion);
  camera.position.set(0, 0, distance).applyQuaternion(quaternion).add(target);
  camera.zoom = zoom;
  camera.updateProjectionMatrix();
  v.controls.orbit.target.copy(target);
  v.gizmo?.cameraUpdate();
}

/** A press on a draggable group disables the controls until its release, so moving the pointer drags the group rather than turning the camera */
function onPointerDown<Content>(v: Viewer<Content>, event: PointerEvent): void {
  v.pointer.pressed = event.pointerId;
  if (event.target !== v.canvas || v.pointer.drag) {
    return;
  }
  v.pointer.down = { x: event.clientX, y: event.clientY };
  const hit = event.button === 0 && v.options.canDragGroup ? pick(v, event) : undefined;
  const target = hit && v.compiled!.targets[hit.target];
  const args: GroupArgs | undefined = hit && target?.kind === "group" ? [target.id, target.rootData, v.compiled!.items[hit.item]!.data] : undefined;
  if (hit && args && v.options.canDragGroup?.(...args)) {
    const { dropped } = v.pointer;
    const base = dropped?.target === hit.target ? dropped.offset.clone() : new Vector3();
    v.pointer.drag = {
      pointerId: event.pointerId,
      args,
      target: hit.target,
      point: hit.point,
      base,
      box: new Box3(),
      offset: base.clone(),
      started: false,
    };
    v.controls.orbit.enabled = false;
    // Captured, so its release is the canvas' also off it, before its drag started too
    v.canvas.setPointerCapture(event.pointerId);
  }
}

function onPointerMove<Content>(v: Viewer<Content>, event: PointerEvent): void {
  v.pointer.last = event;
  const { drag, down } = v.pointer;
  if (drag?.pointerId === event.pointerId && !drag.started && down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > clickTolerance) {
    drag.started = true;
    const box = getSolidsBox(v.built!, [drag.target]);
    // Where it's placed, moved back by the drop's offset to where it's built
    drag.box.copy(box.isEmpty() ? box.setFromCenterAndSize(drag.point, new Vector3()) : box).translate(center.copy(drag.base).negate());
    v.options.onDragGroup?.(...drag.args, { nativeEvent: event, point: drag.point });
  }
  v.pointer.frame ||= requestAnimationFrame(() => hoverAtPointer(v));
}

function onPointerUp<Content>(v: Viewer<Content>, event: PointerEvent): void {
  const { drag, pressed } = v.pointer;
  if (drag?.pointerId === event.pointerId) {
    // Picked while dragged, so not the dragged group under the pointer
    endDrag(v, drag, drag.started && event.type === "pointerup" ? pick(v, event) : undefined, event);
  } else if (pressed !== event.pointerId && event.type === "pointerup" && event.button === 0) {
    v.canvas.style.cursor = v.pointer.hovered ? "pointer" : "";
    v.options.onDropExternal?.(getDropTarget(v, pick(v, event)), event);
  }
}

/** Escape cancels a drag, as its release on nothing does */
function onKeyDown<Content>(v: Viewer<Content>, event: KeyboardEvent): void {
  if (event.key === "Escape" && v.pointer.drag?.started) {
    endDrag(v, v.pointer.drag, undefined, event);
  }
}

/** The press's end, dropping the group on the hit if its drag started, enables the controls again, unless a gizmo click's turn disabled them */
function endDrag<Content>(v: Viewer<Content>, drag: Drag, hit: Hit | undefined, event: MouseEvent | KeyboardEvent): void {
  v.pointer.drag = undefined;
  v.controls.orbit.enabled = !v.turn && (v.controls.current.options.enabled ?? true);
  v.canvas.style.cursor = v.pointer.hovered ? "pointer" : "";
  if (drag.started) {
    // Not a click too, should the pointer have come back to where it was pressed
    v.pointer.down = undefined;
    const dropTarget = getDropTarget(v, hit);
    // Kept where it was dropped on a target, else back where it was pressed, where the frames place it if a drop had moved it
    if (dropTarget) {
      v.pointer.dropped = { target: drag.target, offset: drag.offset };
    } else if (v.built && v.pointer.dropped?.target !== drag.target) {
      moveTarget(v.built, drag.target, new Vector3(), v.loop.seconds);
    }
    invalidate(v);
    v.options.onDropGroup?.(drag.args[0], dropTarget, event);
  }
}

/** The relation or group hit, what's dropped on it, or undefined for nothing */
function getDropTarget<Content>(v: Viewer<Content>, hit: Hit | undefined): DropTarget | undefined {
  const target = hit && v.compiled!.targets[hit.target];
  const args = hit && getGroupArgs(v, hit);
  return hit && target?.kind === "relation"
    ? { kind: "relation", relation: target.relation, point: hit.point }
    : hit && args
      ? { kind: "group", id: args[0], rootData: args[1], data: args[2], point: hit.point }
      : undefined;
}

/** One pick per frame at most, paused while the camera is dragged, as the r3f renderer's ControlsWrapper paused pointer events */
function hoverAtPointer<Content>(v: Viewer<Content>): void {
  v.pointer.frame = 0;
  const { last, drag } = v.pointer;
  if (!last || v.controls.drag.moved) {
    return;
  }
  const hit = pick(v, last);
  setHovered(v, hit, last);
  const target = hit && v.compiled!.targets[hit.target];
  if (drag?.started && hit && target?.kind === "relation") {
    // Its middle on the hotspot's slab's
    drag.offset.subVectors(getSolidsBox(v.built!, [hit.target]).getCenter(point), drag.box.getCenter(center));
    invalidate(v);
  } else if (
    drag?.started &&
    raycaster.ray.intersectPlane(plane.setFromNormalAndCoplanarPoint(v.camera.getWorldDirection(point), drag.point), point)
  ) {
    // The point pressed kept under the pointer, on the plane through it facing the camera, by the ray the pick set
    drag.offset.subVectors(point, drag.point).add(drag.base);
    invalidate(v);
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
  // Grabbing while a group is dragged, or while a press outside the viewer is held over it, e.g. an item dragged from a menu
  const dragged = v.pointer.drag?.started ?? (event.buttons === 1 && v.pointer.pressed === undefined);
  v.canvas.style.cursor = dragged ? "grabbing" : hit ? "pointer" : "";
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
  const target = hit && v.compiled!.targets[hit.target];
  if (hit && target?.kind === "relation") {
    // Its shape's middle, as hoverAtPointer snaps a dragged group's, on the canvas
    const middle = getSolidsBox(v.built!, [hit.target]).getCenter(new Vector3()).project(v.camera);
    const rect = v.canvas.getBoundingClientRect();
    v.options.onHoverRelation?.({
      relation: target.relation,
      x: rect.left + ((middle.x + 1) / 2) * rect.width,
      y: rect.top + ((1 - middle.y) / 2) * rect.height,
    });
  } else if (previous && v.compiled!.targets[previous.target]?.kind === "relation") {
    v.options.onHoverRelation?.(undefined);
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
  // A hotspot's symbol first, as it's drawn over what's behind its middle
  const all = raycaster.intersectObjects(getPickables(built), false);
  const symbol = getHotspotHit(built.hotspots, raycaster, all);
  const hits = symbol ? [symbol] : all;
  v.stats.pickMs = performance.now() - start;
  for (const hit of hits) {
    const item = getPickedItem(built, hit);
    const target = item === undefined ? undefined : built.compiled.items[item]!.target;
    const kind = target === undefined ? undefined : built.compiled.targets[target]!;
    const interactive =
      kind?.kind === "group"
        ? kind.id !== "" && !built.targetStates[target!]!.disabled && !(v.pointer.drag?.started && target === v.pointer.drag.target)
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
function getGroupArgs<Content>(v: Viewer<Content>, hit: Hit): GroupArgs | undefined {
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

/** The scene is lit by a studio room as its environment, or without it by a plain sky and floor light; apps can add their own lights */
function updateLights<Content>(v: Viewer<Content>): void {
  const { scene, lights, studio = true, environmentIntensity = studio ? studioIntensity : plainIntensity } = v.options;
  v.lights.clear();
  (typeof lights === "function" ? (scene ? lights(scene) : []) : (lights ?? [])).forEach((o) => v.lights.add(o));
  v.scene.environmentIntensity = environmentIntensity;
  v.scene.environment = studio ? (v.studio.target?.texture ?? null) : null;
  if (studio) {
    // A bounce light from behind and below, as the room's lights are above and in front, so the back and underside aren't dark
    const bounce = new DirectionalLight(0xffffff, environmentIntensity * bounceIntensity);
    bounce.position.copy(bounceDirection);
    v.lights.add(bounce);
    loadStudio(v).catch(() => undefined);
  } else {
    // The studio emulated by three-point lighting: a weak sky and floor light, so faces differ by which way they turn, the key light, a fill from
    // the other side, so the key light's shadow side isn't flat, and a rim light from behind, which outlines edges
    const [fill, rim] = [
      new DirectionalLight(0xffffff, environmentIntensity * fillIntensity),
      new DirectionalLight(0xffffff, environmentIntensity * rimIntensity),
    ];
    fill.position.copy(fillDirection);
    rim.position.copy(rimDirection);
    v.lights.add(new HemisphereLight(0xffffff, floorColor, environmentIntensity * skyIntensity), fill, rim);
  }
}

/** The studio, loaded once, its own chunk; set when it arrives, so the scene's shaders are compiled after it, with it */
function loadStudio<Content>(v: Viewer<Content>): Promise<unknown> {
  v.studio.loading ??= import("../environment/studio.js").then(({ createStudio }) => {
    if (v.disposed) {
      return undefined;
    }
    const target = createStudio(v.renderer);
    v.studio.target = target;
    v.scene.environment = v.options.studio === false ? null : target.texture;
    invalidate(v);
    return target;
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
const studioIntensity = 0.45;
const plainIntensity = 0.6;
/** Without the studio, of its three-point lighting, by the environment's intensity; the key light is the studio's, the floor as the studio's */
const skyIntensity = 2.5;
const fillIntensity = 2;
const rimIntensity = 2;
const floorColor = 0xe6e6e6;
/** From the right, opposite the key light from the upper left front, and lower; the rim light from behind and above */
const fillDirection = new Vector3(1.5, 0.5, 1);
const rimDirection = new Vector3(0.5, 1.5, -1.5);
const bounceIntensity = 2.5;
const bounceDirection = new Vector3(0.3, -1, -1);

const raycaster = new Raycaster();
const ndc = new Vector2();
const plane = new Plane();
const point = new Vector3();
const center = new Vector3();
