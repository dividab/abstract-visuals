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
import { zOrderElement } from "./svg-geometries/shared.js";
import { box } from "./svg-geometries/svg-box.js";
import { cylinder } from "./svg-geometries/svg-cylinder.js";
import { line } from "./svg-geometries/svg-line.js";
import { plane } from "./svg-geometries/svg-plane.js";
import { shape } from "./svg-geometries/svg-shape.js";
import { polygon } from "./svg-geometries/svg-polygon.js";
import { text } from "./svg-geometries/svg-text.js";
import { cone } from "./svg-geometries/svg-cone.js";
import { rotationForCameraPos, sizeCenterForCameraPos } from "../shared.js";
import { svg } from "./svg-encoding.js";

// dummy

export function toSvg(
  scene: Scene,
  view: View,
  stroke: number,
  scale?: { readonly size: number; readonly scaleByWidth: boolean },
  onlyStroke?: boolean,
  grayScale?: boolean,
  onlyStrokeFill: string = "rgba(255,255,255,0)",
  font: string = "",
  imageDataByUrl?: Record<string, Uint8Array | string>,
  rotation?: number
): { readonly image: string; readonly width: number; readonly height: number } {
  const factor = scale
    ? scale.size /
      (scale.scaleByWidth
        ? view === "right" || view === "left"
          ? scene.size_deprecated.z
          : scene.size_deprecated.x
        : view === "top" || view === "bottom"
        ? scene.size_deprecated.z
        : scene.size_deprecated.y)
    : 1;
  const baseRot = vec3RotCombine(rotationForCameraPos(view), scene.rotation_deprecated ?? vec3Zero);
  const unitRot = rotation ? vec3RotCombine(vec3(0, 0, (rotation * Math.PI) / 180), baseRot) : baseRot;

  const unitPos = vec3Rot(scene.center_deprecated ?? vec3Zero, vec3Zero, scene.rotation_deprecated ?? vec3Zero);
  const [size, center] = sizeCenterForCameraPos(scene.size_deprecated, unitPos, unitRot, factor);
  const unitHalfSize = vec3Scale(size, 0.5);
  const centerAdj = vec3(center.x - stroke * 0.75, center.y + stroke * 0.75, center.z);
  const width = size.x + 1.5 * stroke;
  const height = size.y + 1.5 * stroke;
  const elements = Array<zOrderElement>();
  const point = (x: number, y: number): Vec2 =>
    vec2(-centerAdj.x + unitHalfSize.x + x * factor, centerAdj.y + unitHalfSize.y - y * factor);
  for (const g of scene.groups) {
    const pos = vec3Rot(g.pos, unitPos, unitRot);
    const rot = vec3RotCombine(unitRot, g.rot ?? vec3Zero);
    elements.push(
      ...svgGroup(g, pos, rot, point, view, factor, onlyStroke, grayScale, onlyStrokeFill, font, stroke, imageDataByUrl)
    );
  }
  elements.sort((a, b) => a.zOrder - b.zOrder);
  const cameraPos = vec3Rot(vec3(1, 1, 1), vec3Zero, scene.rotation_deprecated ?? vec3Zero);
  for (const d of scene.dimensions_deprecated?.dimensions ?? []) {
    if (flipViews(d.views[0], cameraPos) === view) {
      const pos = vec3Rot(d.pos, unitPos, unitRot);
      const rot = vec3RotCombine(unitRot, d.rot);
      for (const m of d.meshes) {
        elements.push(
          ...svgMesh(
            m,
            pos,
            rot,
            point,
            view,
            factor,
            scene.dimensions_deprecated?.material ?? { normal: "" },
            false,
            false,
            onlyStrokeFill,
            font,
            stroke,
            imageDataByUrl
          )
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
  view: View,
  factor: number,
  onlyStroke: boolean | undefined,
  grayScale: boolean | undefined,
  onlyStrokeFill: string,
  font: string,
  stroke: number,
  imageDataByUrl?: Record<string, Uint8Array | string>
): ReadonlyArray<zOrderElement> {
  const elements = Array<zOrderElement>();

  for (const m of g.meshes ?? []) {
    elements.push(
      ...svgMesh(
        m,
        pos,
        rot,
        point,
        view,
        factor,
        m.material,
        onlyStroke,
        grayScale,
        onlyStrokeFill,
        font,
        stroke,
        imageDataByUrl
      )
    );
  }
  for (const sg of g.groups ?? []) {
    const sPos = vec3TransRot(sg.pos, pos, rot);
    const sRot = vec3RotCombine(rot, sg.rot ?? vec3Zero);
    elements.push(
      ...svgGroup(
        sg,
        sPos,
        sRot,
        point,
        view,
        factor,
        onlyStroke,
        grayScale,
        onlyStrokeFill,
        font,
        stroke,
        imageDataByUrl
      )
    );
  }
  return elements;
}

function svgMesh(
  mesh: Mesh,
  parentPos: Vec3,
  parentRot: Vec3,
  point: (x: number, y: number) => Vec2,
  view: View,
  factor: number,
  material: Material,
  onlyStroke: boolean | undefined,
  grayScale: boolean | undefined,
  background: string,
  font: string,
  stroke: number,
  imageDataByUrl: Record<string, Uint8Array | string> | undefined
): ReadonlyArray<zOrderElement> {
  const color = material.normal;
  switch (mesh.geometry.type) {
    case "Box":
      return box(mesh.geometry, point, color, onlyStroke, grayScale, stroke, background, parentPos, parentRot);
    case "Plane":
      return plane(
        mesh.geometry,
        point,
        material,
        onlyStroke,
        grayScale,
        stroke,
        background,
        parentPos,
        parentRot,
        view,
        imageDataByUrl
      );
    case "Cylinder":
      return cylinder(
        mesh.geometry,
        point,
        color,
        onlyStroke,
        grayScale,
        stroke,
        background,
        parentPos,
        parentRot,
        factor
      );
    case "Cone":
      return cone(mesh.geometry, point, color, onlyStroke, grayScale, stroke, background, parentPos, parentRot, factor);
    case "Line":
      return line(mesh.geometry, point, color, grayScale, stroke, parentPos, parentRot);
    case "Polygon":
      return polygon(mesh.geometry, point, color, onlyStroke, grayScale, background, stroke, parentPos, parentRot);
    case "Shape":
      return shape(mesh.geometry, point, color, onlyStroke, grayScale, background, stroke, parentPos, parentRot);
    case "Text":
      return text(mesh.geometry, point, color, parentPos, parentRot, factor, font);
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
