import type { Object3D, Texture } from "three";
import type { Group, Relation, Scene, Vec3, View } from "../../../abstract-3d.js";
import type { MaterialState } from "../appearance/appearance.js";
import type { BufferZones, CameraOptions } from "../camera/camera.js";
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

export type ViewerOptions<Content> = {
  /** Undefined shows the fallback */
  readonly scene?: Scene;
  /** The id of a top-level group, which its hover, selection, material state and events are by; groups without an id can't be clicked */
  readonly createGroupId?: (g: Group) => string;
  readonly selectedIds?: Record<string, boolean>;
  readonly hoveredIds?: ReadonlyArray<string>;
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
  readonly fitPadding?: number;
  readonly controls?: ControlsOptions;
  readonly gizmo?: ControlsHelper;
  /** Replace the default lights, a weak ambient light, a key light from the upper left and two fills */
  readonly lights?: ReadonlyArray<Object3D> | ((scene: Scene) => ReadonlyArray<Object3D>);
  /** Lights faces by which way they turn and gives metal reflections: `studio` by default, `room` for three's RoomEnvironment, or null for none */
  readonly environment?: Texture | "studio" | "room" | null;
  readonly environmentIntensity?: number;
  /** A soft shadow on the ground under the scene, rendered once per build; on by default */
  readonly groundShadow?: boolean;
  /** The resolution: `low` 1 and `medium` up to 1.5 pixels per CSS pixel, `high`, the default, the screen's; `auto` high until moving gets slow */
  readonly quality?: Quality;
  readonly useAlphaTest?: boolean;
  readonly materialStateImages?: Record<string, string>;
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
  /** A click, not a drag, on nothing clickable, e.g. the background; r3f's Canvas event of the same name */
  readonly onPointerMissed?: (event: MouseEvent) => void;
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
  materialStateImages: ["build"],
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
  environment: ["lights"],
  environmentIntensity: ["lights"],
  groundShadow: ["shadow"],
  quality: ["quality"],
  popovers: ["overlays"],
  getTooltips: ["overlays"],
  onOverlays: [],
  onLoad: [],
  onClickGroup: ["paint"],
  onHoverGroup: [],
  onContextMenuGroup: [],
  onClickRelation: [],
  onPointerMissed: [],
};
