import type { OrthographicCamera, PerspectiveCamera, WebGLRenderer } from "three";
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
  helper: ControlsHelper
): ViewportGizmo {
  const [mx, my] = helper.props?.margin ?? [80, 80];
  const options = helper.type === "Viewcube" ? helper.viewcubeProps : helper.viewportProps;
  // "600 24px Helvetica, Arial" is weight 600 of Helvetica, Arial
  const [, weight = 600, family = "Helvetica, Arial, sans-serif"] = /^(?:(\S+)\s+)?[\d.]+px\s+(.+)$/.exec(options?.font ?? "") ?? [];
  const gizmo = new ViewportGizmo(camera, renderer, {
    container,
    size,
    placement: helper.props?.alignment ?? "bottom-right",
    offset: { left: mx - size / 2, right: mx - size / 2, top: my - size / 2, bottom: my - size / 2 },
    font: { family, weight },
    ...(helper.type === "Viewcube" ? getViewcubeOptions(helper.viewcubeProps ?? {}) : getAxesOptions(helper.viewportProps ?? {})),
  });
  gizmo.enabled = !(helper.type === "Viewport" && helper.viewportProps?.disabled);
  return gizmo;
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
