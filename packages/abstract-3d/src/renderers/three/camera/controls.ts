import type { OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/** The r3f renderer's OrbitControls, with drei's damping default */

export type ControlsOptions = Partial<Omit<OrbitControls, "object" | "domElement" | "target" | "cursor">> & {
  readonly onStart?: () => void;
  readonly onChange?: () => void;
  readonly onEnd?: () => void;
};

export type Controls = {
  readonly orbit: OrbitControls;
  readonly current: { options: ControlsOptions };
  /** The user drags the camera, and it moved since the drag started */
  readonly drag: { active: boolean; moved: boolean };
};

export function createControls(
  camera: PerspectiveCamera | OrthographicCamera,
  element: HTMLElement,
  options: ControlsOptions,
  onInput: () => void
): Controls {
  const controls: Controls = { orbit: new OrbitControls(camera, element), current: { options }, drag: { active: false, moved: false } };
  configureControls(controls, options);
  controls.orbit.addEventListener("start", () => onDragStart(controls, onInput));
  controls.orbit.addEventListener("change", () => onDragChange(controls, onInput));
  controls.orbit.addEventListener("end", () => onDragEnd(controls));
  return controls;
}

/** Sets the options that are defined, so ones left out keep their defaults */
export function configureControls(controls: Controls, options: ControlsOptions): void {
  controls.current.options = options;
  controls.orbit.enableDamping = true;
  Object.entries(options as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && typeof value !== "function") {
      Object.assign(controls.orbit, { [key]: value });
    }
  });
}

export function setPose(controls: Controls, position: Vector3, target: Vector3): void {
  controls.orbit.target.copy(target);
  controls.orbit.object.position.copy(position);
  controls.orbit.update();
}

function onDragStart(controls: Controls, onInput: () => void): void {
  Object.assign(controls.drag, { active: true, moved: false });
  controls.current.options.onStart?.();
  onInput();
}

function onDragChange(controls: Controls, onInput: () => void): void {
  controls.drag.moved = controls.drag.active;
  controls.current.options.onChange?.();
  onInput();
}

function onDragEnd(controls: Controls): void {
  Object.assign(controls.drag, { active: false, moved: false });
  controls.current.options.onEnd?.();
}
