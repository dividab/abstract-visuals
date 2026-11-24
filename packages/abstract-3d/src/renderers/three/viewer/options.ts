import type { Object3D } from "three";
import type { Group, Relation, Scene, Vec3, View } from "../../../abstract-3d.js";
import type { MaterialState } from "../appearance/appearance.js";
import type { BufferZones, CameraOptions, FitPadding } from "../camera/camera.js";
import type { ControlsOptions } from "../camera/controls.js";
import type { ControlsHelper } from "../camera/gizmo.js";
import type { Quality } from "../quality/quality.js";
import type { MountOverlays } from "./overlays.js";

/** The viewer's options, and what passing each of them in an update redoes; telling which actually changed is the caller's, e.g. React's dependencies */

export type Popover<Content> = { readonly id: string; readonly pos: Vec3; readonly content: Content };

export type SceneEvent = {
  readonly nativeEvent: MouseEvent;
  /** Where the pointer hit, in world space */
  readonly point: Vec3;
};

/** A group's data: of the top-level group, and of the group the hit mesh is in */
type Data = Record<string, string> | undefined;

/** What a dragged group is released on, and where the pointer hit it, in world space */
export type DropTarget =
  | { readonly kind: "relation"; readonly relation: Relation; readonly point: Vec3 }
  | { readonly kind: "group"; readonly id: string; readonly rootData: Data; readonly data: Data; readonly point: Vec3 };

export type ViewerOptions<Content> = {
  /** Undefined shows the fallback */
  readonly scene?: Scene;
  /** The id of a top-level group, which its hover, selection, material state and events are by; groups without an id can't be clicked */
  readonly createGroupId?: (g: Group) => string;
  /** Boxed on their solids' bounds, tinted, with bold edges, faint where hidden; their colors stay their own */
  readonly selectedIds?: Record<string, boolean>;
  readonly hoveredIds?: ReadonlyArray<string>;
  /** Fills the groups' solids with the state's color, but an error or warning on a group with symbol images frames and badges its symbols instead */
  readonly activeComponents?: Record<string, MaterialState>;
  /**
   * The ids of the relations whose shape is drawn to be clicked, e.g. where a component can be inserted. While defined, even when empty, only the
   * groups whose material state is Accept can be clicked
   */
  readonly activeRelations?: ReadonlyArray<string>;
  readonly showDimensions?: boolean;
  /** View, buffer zones and padding are read when the scene is fitted: first, and for a new camera or canvas aspect */
  readonly camera?: CameraOptions;
  readonly view?: View;
  readonly bufferZones?: BufferZones;
  readonly fitPadding?: FitPadding;
  readonly controls?: ControlsOptions;
  readonly gizmo?: ControlsHelper;
  /** Lights added to the studio and key light that light the scene; none by default */
  readonly lights?: ReadonlyArray<Object3D> | ((scene: Scene) => ReadonlyArray<Object3D>);
  /** Of the studio's light, 0.45 by default, or without the studio of its plain light, 0.6 by default, the key light giving the rest */
  readonly environmentIntensity?: number;
  /**
   * The studio's light and reflections, a room with soft area lights, on by default. Off, three-point lighting emulates it, a weak sky and floor
   * light, the key light, a fill and a rim light, without reflections, so metals are satin at most; a first visit then shows the scene about 400 ms
   * sooner, as its shaders compile without the reflection code. Changing it rebuilds the scene
   */
  readonly studio?: boolean;
  /** A soft shadow on the ground under the scene, rendered once per build; on by default */
  readonly groundShadow?: boolean;
  /** The solids' shadows on themselves, e.g. under a roof, cast by the key light from the upper left front; on by default */
  readonly shadows?: boolean;
  /** The resolution: `low` 1 and `medium` up to 1.5 pixels per CSS pixel, `high`, the default, the screen's; `auto` high until moving gets slow */
  readonly quality?: Quality;
  readonly useAlphaTest?: boolean;
  readonly popovers?: ReadonlyArray<Popover<Content>>;
  readonly getTooltips?: (id: string) => ReadonlyArray<Popover<Content>>;
  /** Mounts popover and tooltip content, e.g. as React portals; without it, strings and DOM nodes are mounted directly */
  readonly onOverlays?: MountOverlays<Content>;
  /** A built scene's shaders are compiled, so its first frame renders without a stall, e.g. to hide a fallback */
  readonly onLoad?: () => void;
  readonly onClickGroup?: (id: string, rootData: Data, data: Data, event: SceneEvent) => void;
  /** Called with no id when the pointer leaves the group */
  readonly onHoverGroup?: (id: string | undefined, rootData: Data, data: Data, event: SceneEvent) => void;
  readonly onContextMenuGroup?: (id: string, rootData: Data, data: Data, left: number, top: number, event: SceneEvent) => void;
  readonly onClickRelation?: (relation: Relation, event: SceneEvent) => void;
  /**
   * The active relation under the pointer, and its shape's middle in client pixels, which a dragged group's middle snaps to, e.g. to snap what's
   * dragged from outside the viewer the same way; undefined once the pointer leaves it
   */
  readonly onHoverRelation?: (hovered: { readonly relation: Relation; readonly x: number; readonly y: number } | undefined) => void;
  /** A click, not a drag, on nothing clickable, e.g. the background; r3f's Canvas event of the same name */
  readonly onPointerMissed?: (event: MouseEvent) => void;
  /**
   * Whether the top-level group pressed is dragged by moving the pointer, instead of the camera turned, e.g. one of a component's boxes drawn as a
   * piece of its own; a click on it still clicks
   */
  readonly canDragGroup?: (id: string, rootData: Data, data: Data) => boolean;
  /** A draggable group's drag started: the pointer moved past a click while pressed on it, e.g. to make the relations it can be dropped on active */
  readonly onDragGroup?: (id: string, rootData: Data, data: Data, event: SceneEvent) => void;
  /** The dragged group is released on the relation or group under the pointer, or on nothing, also when Escape or the browser cancels the drag */
  readonly onDropGroup?: (id: string, target: DropTarget | undefined, event: MouseEvent | KeyboardEvent) => void;
  /**
   * A press outside the viewer is released on it, on the relation or group under the pointer, or on nothing, e.g. an item dragged from a menu to
   * where it's inserted
   */
  readonly onDropExternal?: (target: DropTarget | undefined, event: MouseEvent) => void;
};

/** What an update has to redo, in the order it's redone */
export type Change = "compile" | "build" | "shadow" | "camera" | "controls" | "gizmo" | "lights" | "quality" | "paint" | "dimensions" | "overlays";

/** What passing each option redoes; callbacks and what's read later need nothing */
export const effects: { readonly [K in keyof ViewerOptions<unknown>]-?: ReadonlyArray<Change> } = {
  scene: ["compile", "build", "lights", "overlays"],
  createGroupId: ["compile", "build"],
  activeComponents: ["build"],
  activeRelations: ["build"],
  useAlphaTest: ["build"],
  selectedIds: ["paint"],
  hoveredIds: ["paint"],
  showDimensions: ["dimensions"],
  camera: ["camera"],
  view: [],
  bufferZones: [],
  fitPadding: [],
  controls: ["controls"],
  gizmo: ["gizmo"],
  lights: ["lights"],
  environmentIntensity: ["lights"],
  studio: ["build", "lights"],
  groundShadow: ["shadow"],
  shadows: ["shadow"],
  quality: ["quality"],
  popovers: ["overlays"],
  getTooltips: ["overlays"],
  onOverlays: [],
  onLoad: [],
  onClickGroup: ["paint"],
  onHoverGroup: [],
  onContextMenuGroup: [],
  onClickRelation: [],
  onHoverRelation: [],
  onPointerMissed: [],
  canDragGroup: [],
  onDragGroup: [],
  onDropGroup: [],
  onDropExternal: [],
};
