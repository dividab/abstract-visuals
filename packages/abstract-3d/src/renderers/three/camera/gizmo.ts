import type { OrthographicCamera, PerspectiveCamera, WebGLRenderer } from "three";
import { BufferGeometry, Material, MathUtils, Mesh, MeshBasicMaterial, Spherical, Sprite, SpriteMaterial } from "three";
import type { GizmoAxisOptions, GizmoOptions } from "three-viewport-gizmo";
import { ViewportGizmo } from "three-viewport-gizmo";

/**
 * A viewcube or axes in a corner of the canvas that turns with the camera; clicking it turns the camera to look from that side. three-viewport-gizmo,
 * with the options of drei's GizmoViewcube and GizmoViewport that the r3f renderer took
 */

export type GizmoAlignment = `${"top" | "center" | "bottom"}-${"left" | "center" | "right"}`;

export type ViewcubeOptions = {
  /** A CSS font; its weight and family are used */
  readonly font?: string;
  readonly opacity?: number;
  readonly color?: string;
  readonly hoverColor?: string;
  readonly textColor?: string;
  readonly strokeColor?: string;
  /** Labels of the +x, -x, +y, -y, +z and -z faces */
  readonly faces?: ReadonlyArray<string>;
  /** Clicking also moves the target back to the scene's center and fits the scene */
  readonly resetZoomAndPanOnClick?: boolean;
};

export type AxesOptions = {
  readonly axisColors?: readonly [string, string, string];
  readonly labels?: readonly [string, string, string];
  readonly labelColor?: string;
  readonly hideNegativeAxes?: boolean;
  readonly disabled?: boolean;
  readonly font?: string;
  readonly resetZoomAndPanOnClick?: boolean;
};

export type ControlsHelper = (
  | { readonly type: "Viewcube"; readonly viewcubeProps?: ViewcubeOptions }
  | { readonly type: "Viewport"; readonly viewportProps?: AxesOptions }
) & {
  /** The margin is from the canvas' corner to the gizmo's center, in CSS pixels */
  readonly props?: { readonly alignment?: GizmoAlignment; readonly margin?: readonly [number, number] };
};

const size = 110;
const axes = ["x", "nx", "y", "ny", "z", "nz"] as const;

export function createGizmo(
  camera: PerspectiveCamera | OrthographicCamera,
  renderer: WebGLRenderer,
  container: HTMLElement,
  helper: ControlsHelper,
  onHover: () => void
): ViewportGizmo {
  const [mx, my] = helper.props?.margin ?? [80, 80];
  const options = helper.type === "Viewcube" ? helper.viewcubeProps : helper.viewportProps;
  // "600 24px Helvetica, Arial" is weight 600 of Helvetica, Arial
  const [, weight = 600, family = "Helvetica, Arial, sans-serif"] = /^(?:(\S+)\s+)?[\d.]+px\s+(.+)$/.exec(options?.font ?? "") ?? [];
  // Hovering changes its look without a change event, as it's made for a render loop, so its pointer events are caught as they bubble through a
  // parent of its own, which has no box, so it's placed in the container as before
  const layer = Object.assign(document.createElement("div"), { style: "display: contents" });
  ["pointermove", "pointerout"].forEach((type) => layer.addEventListener(type, onHover));
  layer.addEventListener("pointerdown", (event) => dragGizmo(gizmo, event));
  container.append(layer);
  const gizmo = new ViewportGizmo(camera, renderer, {
    container: layer,
    size,
    placement: helper.props?.alignment ?? "bottom-right",
    offset: { left: mx - size / 2, right: mx - size / 2, top: my - size / 2, bottom: my - size / 2 },
    // A family without a generic fallback, e.g. a web font, would otherwise fall back to the browser's serif
    font: { family: `${family}, sans-serif`, weight },
    // A click moves the camera at once, for the viewer to turn it there, eased and also fitting the scene
    animated: false,
    ...(helper.type === "Viewcube" ? getViewcubeOptions(helper.viewcubeProps ?? {}) : getAxesOptions(helper.viewportProps ?? {})),
  });
  gizmo.enabled = !(helper.type === "Viewport" && helper.viewportProps?.disabled);
  return gizmo;
}

/**
 * Its own drag turns the camera only once the pointer moved 10 pixels away, by all of them at once, so a drag turns it here from the first pixel, the
 * same way, from where it was pressed: the turn is half a revolution per gizmo width. As each move's listener here runs after its own, which it adds
 * when pressed, its drag is overridden; a press that moves less than that is still its click. Its press disables the controls, and only a drag or a
 * click on a side ends it, so a release that starts no turn ends it here, enabling them again
 */
function dragGizmo(gizmo: ViewportGizmo, press: PointerEvent): void {
  if (gizmo.enabled && !gizmo.animating) {
    const { camera, target } = gizmo;
    const { theta, phi } = new Spherical().setFromVector3(camera.position.clone().sub(target));
    const listeners = new AbortController();
    const signal = { signal: listeners.signal };
    document.addEventListener(
      "pointermove",
      (event) => {
        const [x, y] = [((event.clientX - press.clientX) / size) * Math.PI, ((event.clientY - press.clientY) / size) * Math.PI];
        const turned = new Spherical(camera.position.distanceTo(target), MathUtils.clamp(phi - y, 1e-6, Math.PI - 1e-6), theta - x);
        camera.position.setFromSpherical(turned).add(target);
        camera.lookAt(target);
        gizmo.cameraUpdate();
        gizmo.dispatchEvent({ type: "change" });
      },
      signal
    );
    const release = (): void => {
      listeners.abort();
      if (!gizmo.animating) {
        gizmo.dispatchEvent({ type: "end" });
      }
    };
    ["pointerup", "pointercancel"].forEach((type) => document.addEventListener(type, release, signal));
  }
}

/**
 * Its own dispose() frees only every other child, as it removes them while iterating over them, so it's left to detach it from the controls and DOM;
 * the layer from createGizmo is removed with its listeners
 */
export function disposeGizmo(gizmo: ViewportGizmo): void {
  if (gizmo.options.container instanceof HTMLElement) {
    gizmo.options.container.remove();
  }
  gizmo.children.forEach((child) => {
    // Faces, corners, edges and background are meshes, the axes' ends sprites and their lines a Line2 mesh, each with one material
    if ((child instanceof Mesh || child instanceof Sprite) && child.material instanceof Material && child.geometry instanceof BufferGeometry) {
      if (child.material instanceof MeshBasicMaterial || child.material instanceof SpriteMaterial) {
        child.material.map?.dispose();
      }
      child.material.dispose();
      child.geometry.dispose();
    }
  });
  gizmo.clear().dispose();
}

function getViewcubeOptions(options: ViewcubeOptions): GizmoOptions {
  const { opacity = 1, color = "#f4f5f7", hoverColor = "#cfe0ff", textColor = "#333", strokeColor = "#9aa0a6" } = options;
  const labels = options.faces ?? ["Right", "Left", "Top", "Bottom", "Front", "Back"];
  const face: GizmoAxisOptions = { color, opacity, labelColor: textColor, hover: { color: hoverColor, labelColor: textColor, opacity } };
  return {
    type: "cube",
    background: { color: strokeColor, opacity, hover: { color: strokeColor, opacity } },
    corners: { color, hover: { color: hoverColor } },
    edges: { color, hover: { color: hoverColor } },
    ...Object.fromEntries(axes.map((axis, i) => [axis, { ...face, label: (labels[i] ?? "").toUpperCase() }])),
  };
}

function getAxesOptions(options: AxesOptions): GizmoOptions {
  const { axisColors = ["#ff3653", "#8adb00", "#2c8fff"], labels = ["X", "Y", "Z"], labelColor = "#000" } = options;
  return {
    type: "sphere",
    ...Object.fromEntries(
      axes.map((axis, i) => [
        axis,
        { color: axisColors[Math.floor(i / 2)], labelColor, ...(i % 2 ? { enabled: !options.hideNegativeAxes } : { label: labels[i / 2] }) },
      ])
    ),
  };
}
