import { exhaustiveCheck } from "ts-exhaustive-check";
import type { Scene, Vec3, Mesh, Vec2, Group, Material, Bounds2 } from "../../abstract-3d.js";
import {
  vec2,
  vec3Rot,
  vec3Zero,
  vec3RotCombine,
  vec3,
  vec3TransRot,
  rotationForCameraPos,
  sizeBoundsForCameraPos,
  bounds3Center,
  bounds2FromPosAndSize,
  bounds2ToSize,
  bounds2Merge,
  vec2Zero,
  vec3Flip,
  dimensionConvertToTypeMesh,
  dimensionPlacements,
  groupTextBackgrounds,
  sceneTextHeight,
} from "../../abstract-3d.js";
import type { Optional } from "../../utils.js";
import { svg } from "./svg-encoding.js";
import type { SvgOptions, zOrderElement } from "./svg-geometries/shared.js";
import { box } from "./svg-geometries/svg-box.js";
import { cone } from "./svg-geometries/svg-cone.js";
import { cylinder } from "./svg-geometries/svg-cylinder.js";
import { image } from "./svg-geometries/svg-image.js";
import { lathe } from "./svg-geometries/svg-lathe.js";
import { line } from "./svg-geometries/svg-line.js";
import { plane } from "./svg-geometries/svg-plane.js";
import { polygon } from "./svg-geometries/svg-polygon.js";
import { shape } from "./svg-geometries/svg-shape.js";
import { text } from "./svg-geometries/svg-text.js";
import { orderElements } from "./svg-order.js";
import { encodeElements } from "./svg-paths.js";

export type SvgScene = {
  readonly scene: Scene;
  readonly options?: Optional<SvgOptions>;
  readonly pos: Vec2;
};

export type SvgWithSize = { readonly image: string; readonly width: number; readonly height: number };

export function renderScenes(scenes: ReadonlyArray<SvgScene>, baseOptions?: Optional<SvgOptions>): SvgWithSize {
  let content = "";
  const bounds = Array<Bounds2>();

  for (const view of scenes) {
    const rendered = renderInternal(view.scene, { ...baseOptions, ...view.options }, view.pos);
    content += rendered.content;
    const newBounds = bounds2FromPosAndSize(rendered.center, rendered.size);
    bounds.push(newBounds);
  }
  const mergedBounds = bounds2Merge(...bounds);
  const size = bounds2ToSize(mergedBounds);
  const image = svg(mergedBounds.min, size, content, baseOptions?.className ?? "");
  return { image, width: size.x, height: size.y };
}

export function render(scene: Scene, options?: Optional<SvgOptions>): SvgWithSize {
  const { content, size, center } = renderInternal(scene, options, vec2Zero);

  const image = svg(vec2(center.x - size.x / 2, center.y - size.y / 2), size, content, options?.className ?? "");
  return { image, width: size.x, height: size.y };
}

function renderInternal(
  scene: Scene,
  options: Optional<SvgOptions> | undefined,
  offset: Vec2
): {
  readonly content: string;
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
    imageBg: options?.imageBg ?? false,
    className: options?.className ?? "",
  };
  // A rotation turns the front
  const turned = typeof opts.view === "object";
  const view = turned ? "front" : opts.view;
  const cameraRot = turned ? opts.view : rotationForCameraPos(view);
  const viewRot = opts.rotation ? vec3RotCombine(vec3(0, 0, (opts.rotation * Math.PI) / 180), cameraRot) : cameraRot;

  const unitCenter = vec3Rot(bounds3Center(scene.bounds), vec3Zero, cameraRot);
  const [unitSize] = sizeBoundsForCameraPos(scene.bounds, viewRot);
  const svgSize = vec2(unitSize.x + 1.5 * opts.stroke_thickness, unitSize.y + 1.5 * opts.stroke_thickness);
  const svgCenter = vec2(offset.x + opts.stroke_thickness * 0.75, offset.y + opts.stroke_thickness * 0.75);
  const point = (x: number, y: number): Vec2 => vec2(svgCenter.x + x, svgCenter.y - y);
  const unitCenterFlipped = vec3Flip(unitCenter);

  const textHeight = sceneTextHeight(scene.groups);
  const elements: Array<zOrderElement> = [];
  for (const g of scene.groups) {
    svgGroup(groupTextBackgrounds(g, textHeight), unitCenterFlipped, viewRot, point, opts, textHeight, elements);
  }
  const ordered = orderElements(elements);
  // The dimensions' elements are drawn after the scene's, as they're given
  const dimensionElements: Array<zOrderElement> = [];
  const dimOpts: SvgOptions = { ...opts, only_stroke: false, gray_scale: false };

  // Dimensions are drawn for the flat views
  const dimensions = turned ? [] : (scene.dimensions?.dimensions ?? []);
  const placements = dimensionPlacements(dimensions, textHeight);
  for (const [i, dim] of dimensions.entries()) {
    const d = dimensionConvertToTypeMesh(dim, scene.dimensions?.material, textHeight, placements[i]);
    if (d.views[0] === view) {
      const pos = vec3TransRot(d.pos, unitCenterFlipped, viewRot);
      const rot = vec3RotCombine(viewRot, d.rot);
      for (const m of d.meshes) {
        dimensionElements.push(...svgMesh(m, pos, rot, point, scene.dimensions?.material ?? { normal: "" }, dimOpts, textHeight));
      }
    }
  }
  const content = encodeElements(ordered, point) + encodeElements(dimensionElements, point);
  return { content, size: svgSize, center: svgCenter };
}

/** The group's meshes' elements, then its subgroups', added to `elements` */
function svgGroup(
  g: Group,
  parentPos: Vec3,
  parentRot: Vec3,
  point: (x: number, y: number) => Vec2,
  opts: SvgOptions,
  textHeight: number,
  elements: Array<zOrderElement>
): void {
  const pos = vec3TransRot(g.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, g.rot ?? vec3Zero);
  for (const m of g.meshes ?? []) {
    for (const e of svgMesh(m, pos, rot, point, m.material, opts, textHeight)) {
      elements.push(e);
    }
  }
  for (const sg of g.groups ?? []) {
    svgGroup(sg, pos, rot, point, opts, textHeight, elements);
  }
}

function svgMesh(
  mesh: Mesh,
  parentPos: Vec3,
  parentRot: Vec3,
  point: (x: number, y: number) => Vec2,
  material: Material,
  opts: SvgOptions,
  textHeight: number
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
    case "Lathe":
      return lathe(mesh.geometry, point, material, opts, parentPos, parentRot);
    case "CulledLine":
    case "Line":
      return line(mesh.geometry, point, material.normal, opts, parentPos, parentRot);
    case "Polygon":
      return polygon(mesh.geometry, material, opts, parentPos, parentRot);
    case "Shape":
      return shape(mesh.geometry, material, opts, parentPos, parentRot);
    case "Text":
      return text(mesh.geometry, point, material.normal, opts, parentPos, parentRot, textHeight);
    case "Image":
      return image(mesh.geometry, point, opts, parentPos, parentRot);
    case "Tube":
    case "Sphere":
      return [];
    default:
      return exhaustiveCheck(mesh.geometry);
  }
}
