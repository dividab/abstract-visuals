import type { OrthographicCamera, PerspectiveCamera } from "three";
import { exhaustiveCheck } from "ts-exhaustive-check";
import type { Vec3, View } from "../../../abstract-3d.js";
import { vec3 } from "../../../abstract-3d.js";

/** Fitting the camera to the scene, inside buffer zones of the canvas that UI covers; the fit math of the r3f renderer's react-camera.tsx */

export type CameraOptions =
  | { readonly type: "Perspective"; readonly near?: number; readonly far?: number; readonly fov?: number }
  | { readonly type: "Orthographic"; readonly near?: number; readonly far?: number };

/** Margins of the canvas, in CSS pixels, that the scene is fitted inside of */
export type BufferZones = { readonly left?: number; readonly right?: number; readonly top?: number; readonly bottom?: number };

export type FitInput = {
  readonly view: View;
  /** The scene's size */
  readonly size: Vec3;
  /** In CSS pixels */
  readonly canvas: { readonly width: number; readonly height: number };
  readonly bufferZones: BufferZones;
  readonly fitPadding: number;
};

/** Where to place the camera: its distance from the target, and the direction from the target to it */
export type Placement = { readonly distance: number; readonly direction: Vec3 };

/** Sets the camera's projection to fit the scene into the usable area of the canvas, and returns where to place it */
export function fitCamera(
  camera: PerspectiveCamera | OrthographicCamera,
  { view, size: sceneSize, canvas, bufferZones, fitPadding }: FitInput
): Placement | undefined {
  if (canvas.width === 0 || canvas.height === 0) {
    return undefined;
  }
  const [direction, size, sceneAspect] = getViewTransform(view, sceneSize);
  const { left = 0, right = 0, top = 0, bottom = 0 } = bufferZones;
  const usableW = Math.max(1, canvas.width - left - right);
  const usableH = Math.max(1, canvas.height - top - bottom);
  const usableAspect = usableW / usableH;
  camera.zoom = 1;

  if ("isOrthographicCamera" in camera) {
    const pad = 1 + fitPadding;
    // Constrained by the scene's width when it's wider than the usable area, else by its height
    const [halfW, halfH] =
      sceneAspect > usableAspect
        ? [(size.x / 2) * pad, (size.x / 2 / usableAspect) * pad]
        : [((usableAspect * size.y) / 2) * pad, (size.y / 2) * pad];
    // Extended by the buffer zones, at the world units per CSS pixel of the usable area
    const [wpp, hpp] = [(halfW * 2) / usableW, (halfH * 2) / usableH];
    Object.assign(camera, { left: -halfW - left * wpp, right: halfW + right * wpp, top: halfH + top * hpp, bottom: -halfH - bottom * hpp });
    camera.updateProjectionMatrix();
    const fovTan = Math.tan((45 * Math.PI) / 360);
    return { distance: size.z * 0.5 + Math.max(size.x, size.y) * 2 * fovTan, direction };
  }

  // The field of view describes the usable area; the view offset extends the rendered frustum from it to the full canvas
  const tan = Math.tan((camera.fov * Math.PI) / 360);
  const distance = Math.max(size.y / 2 / tan, size.x / 2 / (tan * usableAspect)) + size.z * 0.5;
  camera.aspect = usableAspect;
  camera.setViewOffset(usableW, usableH, -left, -top, canvas.width, canvas.height);
  camera.updateProjectionMatrix();
  return { distance: distance * (1 + fitPadding), direction };
}

/** The direction to look from, the scene's size as seen on screen and its aspect */
function getViewTransform(view: View, size: Vec3): readonly [Vec3, Vec3, number] {
  switch (view) {
    case "front":
    case "back":
      return [vec3(0, 0, view === "front" ? 1 : -1), size, size.x / size.y];
    case "top":
    case "bottom":
      return [vec3(0, view === "top" ? 1 : -1, 0), vec3(size.x, size.z, size.y), size.x / size.z];
    case "right":
    case "left":
      return [vec3(view === "right" ? 1 : -1, 0, 0), vec3(size.z, size.y, size.x), size.z / size.y];
    default:
      return exhaustiveCheck(view);
  }
}
