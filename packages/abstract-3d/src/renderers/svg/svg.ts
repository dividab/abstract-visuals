import { exhaustiveCheck } from "ts-exhaustive-check";
import {
  vec2,
  vec3Scale,
  Scene,
  View,
  Vec3,
  Mesh,
  vec3Rot,
  vec3Zero,
  vec3RotCombine,
  vec3,
  Vec2,
  Group,
  vec3TransRot,
  Material,
  rotationForCameraPos,
  sizeBoundsForCameraPos,
  Bounds2,
  bounds2FromPosAndSize,
  bounds2ToSize,
  bounds2Merge,
  vec2Zero,
  vec3Sub,
  vec3Flip,
} from "../../abstract-3d.js";
import { SvgOptions, zOrderElement } from "./svg-geometries/shared.js";
import { box } from "./svg-geometries/svg-box.js";
import { cylinder } from "./svg-geometries/svg-cylinder.js";
import { line } from "./svg-geometries/svg-line.js";
import { plane } from "./svg-geometries/svg-plane.js";
import { shape } from "./svg-geometries/svg-shape.js";
import { polygon } from "./svg-geometries/svg-polygon.js";
import { text } from "./svg-geometries/svg-text.js";
import { cone } from "./svg-geometries/svg-cone.js";
import { Optional } from "../shared.js";
import { svg } from "./svg-encoding.js";
import { image } from "./svg-geometries/svg-image.js";

export type SvgScene = {
  readonly scene: Scene;
  readonly options?: Optional<SvgOptions>;
  readonly pos: Vec2;
};

export type SvgWithSize = { readonly image: string; readonly width: number; readonly height: number };

export function renderScenes(scenes: ReadonlyArray<SvgScene>, baseOptions?: Optional<SvgOptions>): SvgWithSize {
  const allElements = Array<zOrderElement>();
  const bounds = Array<Bounds2>();

  for (const view of scenes) {
    const { elements, size, center } = renderInternal(view.scene, { ...baseOptions, ...view.options }, view.pos);
    allElements.push(...elements);
    const newBounds = bounds2FromPosAndSize(center, size);
    bounds.push(newBounds);
  }
  const mergedBounds = bounds2Merge(...bounds);
  const size = bounds2ToSize(mergedBounds);
  const image = svg(
    mergedBounds.min,
    size,
    allElements.reduce((a, { element }) => `${a} ${element}`, "")
  );
  return { image, width: size.x, height: size.y };
}

export function render(scene: Scene, options?: Optional<SvgOptions>): SvgWithSize {
  const { elements, size, center } = renderInternal(scene, options, vec2Zero);

  const image = svg(
    vec2(center.x - size.x / 2, center.y - size.y / 2),
    size,
    elements.reduce((a, { element }) => `${a} ${element}`, "")
  );
  return { image, width: size.x, height: size.y };
}

function renderInternal(
  scene: Scene,
  options: Optional<SvgOptions> | undefined,
  offset: Vec2
): {
  readonly elements: ReadonlyArray<zOrderElement>;
  readonly size: Vec2;
  readonly center: Vec2;
} {
  const opts: SvgOptions = {
    view: options?.view ?? "front",
    stroke_thickness: options?.stroke_thickness ?? 2,
    only_stroke: options?.only_stroke ?? false,
    gray_scale: options?.gray_scale ?? false,
    background: options?.background ?? "rgba(255,255,255,0)",
    font: options?.font ?? "",
    imageDataByUrl: options?.imageDataByUrl ?? {},
    rotation: options?.rotation ?? 0,
  };
  const baseRot = vec3RotCombine(rotationForCameraPos(opts.view), scene.rotation_deprecated ?? vec3Zero);
  const unitRot = opts.rotation ? vec3RotCombine(vec3(0, 0, (opts.rotation * Math.PI) / 180), baseRot) : baseRot;
  const unitCenter = scene.center_deprecated ?? vec3Zero;
  const [unitSize] = sizeBoundsForCameraPos(scene.size_deprecated, scene.center_deprecated ?? vec3Zero, unitRot);
  const svgSize = vec2(unitSize.x + 1.5 * opts.stroke_thickness, unitSize.y + 1.5 * opts.stroke_thickness);
  const svgCenter = vec2(offset.x + opts.stroke_thickness * 0.75, offset.y + opts.stroke_thickness * 0.75);
  const point = (x: number, y: number): Vec2 => vec2(svgCenter.x + x, svgCenter.y - y);
  const unitCenterFlipped = vec3Flip(unitCenter);

  const elements = Array<zOrderElement>();
  for (const g of scene.groups) {
    elements.push(...svgGroup(g, unitCenterFlipped, unitRot, point, opts));
  }
  const dimOpts: SvgOptions = { ...opts, only_stroke: false, gray_scale: false };
  elements.sort((a, b) => a.zOrder - b.zOrder);
  const cameraPos = vec3Rot(vec3(1, 1, 1), vec3Zero, unitRot);
  for (const d of scene.dimensions_deprecated?.dimensions ?? []) {
    if (flipViews(d.views[0], cameraPos) === opts.view) {
      const pos = vec3TransRot(d.pos, unitCenterFlipped, unitRot);
      const rot = vec3RotCombine(unitRot, d.rot);
      for (const m of d.meshes) {
        elements.push(...svgMesh(m, pos, rot, point, scene.dimensions_deprecated?.material ?? { normal: "" }, dimOpts));
      }
    }
  }
  return { elements, size: svgSize, center: svgCenter };
}

function svgGroup(
  g: Group,
  parentPos: Vec3,
  parentRot: Vec3,
  point: (x: number, y: number) => Vec2,
  opts: SvgOptions
): ReadonlyArray<zOrderElement> {
  const pos = vec3TransRot(g.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, g.rot ?? vec3Zero);
  const elements = Array<zOrderElement>();
  for (const m of g.meshes ?? []) {
    elements.push(...svgMesh(m, pos, rot, point, m.material, opts));
  }
  for (const sg of g.groups ?? []) {
    elements.push(...svgGroup(sg, pos, rot, point, opts));
  }
  return elements;
}

function svgMesh(
  mesh: Mesh,
  parentPos: Vec3,
  parentRot: Vec3,
  point: (x: number, y: number) => Vec2,
  material: Material,
  opts: SvgOptions
): ReadonlyArray<zOrderElement> {
  switch (mesh.geometry.type) {
    case "Box":
      return box(mesh.geometry, point, material, opts, parentPos, parentRot);
    case "Plane":
      return plane(mesh.geometry, point, material, opts, parentPos, parentRot);
    case "Cylinder":
      return cylinder(mesh.geometry, point, material, opts, parentPos, parentRot);
    case "Cone":
      return cone(mesh.geometry, point, material, opts, parentPos, parentRot);
    case "Line":
      return line(mesh.geometry, point, material.normal, opts, parentPos, parentRot);
    case "Polygon":
      return polygon(mesh.geometry, point, material, opts, parentPos, parentRot);
    case "Shape":
      return shape(mesh.geometry, point, material, opts, parentPos, parentRot);
    case "Text":
      return text(mesh.geometry, point, material.normal, opts, parentPos, parentRot);
    case "Image":
      return image(mesh.geometry, point, opts, parentPos, parentRot);
    case "Tube":
    case "Sphere":
      return [];
    default:
      return exhaustiveCheck(mesh.geometry);
  }
}

const flipViews = (v: View | undefined, pos: Vec3): View | undefined => {
  switch (v) {
    case "front":
      return pos.z < 0 ? "back" : "front";
    case "back":
      return pos.z < 0 ? "front" : "back";
    case "right":
      return pos.x < 0 ? "left" : "right";
    case "left":
      return pos.x < 0 ? "right" : "left";
    case "top":
      return pos.y < 0 ? "bottom" : "top";
    case "bottom":
      return pos.y < 0 ? "top" : "bottom";
    default:
      return v;
  }
};
