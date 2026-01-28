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
import { Optional, rotationForCameraPos, sizeCenterForCameraPos } from "../shared.js";
import { svg } from "./svg-encoding.js";

export function render(
  scene: Scene,
  options?: Optional<SvgOptions>
): { readonly image: string; readonly width: number; readonly height: number } {
  const opts: SvgOptions = {
    view: options?.view ?? "front",
    stroke: options?.stroke ?? 2,
    scale: options?.scale ?? undefined,
    onlyStroke: options?.onlyStroke ?? false,
    grayScale: options?.grayScale ?? false,
    onlyStrokeFill: options?.onlyStrokeFill ?? "rgba(255,255,255,0)",
    font: options?.font ?? "",
    imageDataByUrl: options?.imageDataByUrl ?? {},
    rotation: options?.rotation ?? 0,
  };

  const factor = opts.scale
    ? opts.scale.size /
      (opts.scale.scaleByWidth
        ? opts.view === "right" || opts.view === "left"
          ? scene.size_deprecated.z
          : scene.size_deprecated.x
        : opts.view === "top" || opts.view === "bottom"
        ? scene.size_deprecated.z
        : scene.size_deprecated.y)
    : 1;
  const baseRot = vec3RotCombine(rotationForCameraPos(opts.view), scene.rotation_deprecated ?? vec3Zero);
  const unitRot = opts.rotation ? vec3RotCombine(vec3(0, 0, (opts.rotation * Math.PI) / 180), baseRot) : baseRot;

  const unitPos = vec3Rot(scene.center_deprecated ?? vec3Zero, vec3Zero, scene.rotation_deprecated ?? vec3Zero);
  const [size, center] = sizeCenterForCameraPos(scene.size_deprecated, unitPos, unitRot, factor);
  const unitHalfSize = vec3Scale(size, 0.5);
  const centerAdj = vec3(center.x - opts.stroke * 0.75, center.y + opts.stroke * 0.75, center.z);
  const width = size.x + 1.5 * opts.stroke;
  const height = size.y + 1.5 * opts.stroke;
  const elements = Array<zOrderElement>();
  const point = (x: number, y: number): Vec2 =>
    vec2(-centerAdj.x + unitHalfSize.x + x * factor, centerAdj.y + unitHalfSize.y - y * factor);

  for (const g of scene.groups) {
    const pos = vec3Rot(g.pos, unitPos, unitRot);
    const rot = vec3RotCombine(unitRot, g.rot ?? vec3Zero);
    elements.push(...svgGroup(g, pos, rot, point, factor, opts));
  }
  const dimOpts: SvgOptions = { ...opts, onlyStroke: false, grayScale: false };
  elements.sort((a, b) => a.zOrder - b.zOrder);
  const cameraPos = vec3Rot(vec3(1, 1, 1), vec3Zero, scene.rotation_deprecated ?? vec3Zero);
  for (const d of scene.dimensions_deprecated?.dimensions ?? []) {
    if (flipViews(d.views[0], cameraPos) === opts.view) {
      const pos = vec3Rot(d.pos, unitPos, unitRot);
      const rot = vec3RotCombine(unitRot, d.rot);
      for (const m of d.meshes) {
        elements.push(
          ...svgMesh(m, pos, rot, point, factor, scene.dimensions_deprecated?.material ?? { normal: "" }, dimOpts)
        );
      }
    }
  }

  const image = svg(
    width,
    height,
    elements.reduce((a, { element }) => `${a} ${element}`, "")
  );
  return { image, width, height };
}

function svgGroup(
  g: Group,
  pos: Vec3,
  rot: Vec3,
  point: (x: number, y: number) => Vec2,
  factor: number,
  opts: SvgOptions
): ReadonlyArray<zOrderElement> {
  const elements = Array<zOrderElement>();
  for (const m of g.meshes ?? []) {
    elements.push(...svgMesh(m, pos, rot, point, factor, m.material, opts));
  }
  for (const sg of g.groups ?? []) {
    const sPos = vec3TransRot(sg.pos, pos, rot);
    const sRot = vec3RotCombine(rot, sg.rot ?? vec3Zero);
    elements.push(...svgGroup(sg, sPos, sRot, point, factor, opts));
  }
  return elements;
}

function svgMesh(
  mesh: Mesh,
  parentPos: Vec3,
  parentRot: Vec3,
  point: (x: number, y: number) => Vec2,
  factor: number,
  material: Material,
  opts: SvgOptions
): ReadonlyArray<zOrderElement> {
  switch (mesh.geometry.type) {
    case "Box":
      return box(mesh.geometry, point, material, opts, parentPos, parentRot, factor);
    case "Plane":
      return plane(mesh.geometry, point, factor, material, opts, parentPos, parentRot);
    case "Cylinder":
      return cylinder(mesh.geometry, point, material, opts, parentPos, parentRot, factor);
    case "Cone":
      return cone(mesh.geometry, point, material, opts, parentPos, parentRot, factor);
    case "Line":
      return line(mesh.geometry, point, material.normal, opts, parentPos, parentRot);
    case "Polygon":
      return polygon(mesh.geometry, point, factor, material, opts, parentPos, parentRot);
    case "Shape":
      return shape(mesh.geometry, point, factor, material, opts, parentPos, parentRot);
    case "Text":
      return text(mesh.geometry, point, material.normal, opts, parentPos, parentRot, factor);
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
