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
} from "../../abstract-3d";
import { zOrderElement } from "./svg-geometries/shared";
import { box } from "./svg-geometries/svg-box";
import { cylinder } from "./svg-geometries/svg-cylinder";
import { line } from "./svg-geometries/svg-line";
import { plane } from "./svg-geometries/svg-plane";
import { shape } from "./svg-geometries/svg-shape";
import { polygon } from "./svg-geometries/svg-polygon";
import { text } from "./svg-geometries/svg-text";
import { cone } from "./svg-geometries/svg-cone";
import { rotationForCameraPos, sizeCenterForCameraPos } from "../shared";
import { EmbededImage, svg } from "./svg-encoding";

export function toSvg(
  scene: Scene,
  view: View,
  onlyStroke: boolean,
  grayScale: boolean,
  stroke: number,
  onlyStrokeFill: string = "rgba(255,255,255,0)",
  font: string = "",
  buffers?: Record<string, string>,
  scale?: { readonly size: number; readonly scaleByWidth: boolean }
): { readonly image: string; readonly width: number; readonly height: number } {
  const factor = scale
    ? scale.size /
      (scale.scaleByWidth
        ? view === "right" || view === "left"
          ? scene.size.z
          : scene.size.x
        : view === "top" || view === "bottom"
        ? scene.size.z
        : scene.size.y)
    : 1;
  const unitRot = vec3RotCombine(rotationForCameraPos(view), scene.rotation ?? vec3Zero);
  const unitPos = vec3Rot(scene.center, vec3Zero, scene.rotation ?? vec3Zero);
  const [size, center] = sizeCenterForCameraPos(scene.size, unitPos, scene.dimensions?.bounds, unitRot, view, factor);
  const unitHalfSize = vec3Scale(size, 0.5);
  const centerAdj = vec3(center.x - stroke * 0.75, center.y + stroke * 0.75, center.z);
  const width = size.x + 1.5 * stroke;
  const height = size.y + 1.5 * stroke;
  const elements = Array<zOrderElement>();
  const point = (x: number, y: number): Vec2 =>
    vec2(-centerAdj.x + unitHalfSize.x + x * factor, centerAdj.y + unitHalfSize.y - y * factor);
  for (const g of scene.groups) {
    const pos = vec3Rot(g.pos, unitPos, unitRot);
    const rot = vec3RotCombine(unitRot, g.rot);
    elements.push(
      ...svgGroup(g, pos, rot, point, view, factor, onlyStroke, grayScale, onlyStrokeFill, font, stroke, buffers)
    );
  }
  elements.sort((a, b) => a.zOrder - b.zOrder);

  for (const d of scene.dimensions?.dimensions ?? []) {
    if (d.views[0] === view) {
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
            scene.dimensions?.material.normal ?? "",
            false,
            false,
            onlyStrokeFill,
            font,
            stroke
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
  onlyStroke: boolean,
  grayScale: boolean,
  onlyStrokeFill: string,
  font: string,
  stroke: number,
  buffers?: Record<string, string>
): ReadonlyArray<zOrderElement> {
  const elements = Array<zOrderElement>();

  for (const m of g.meshes) {
    elements.push(
      ...svgMesh(
        m,
        pos,
        rot,
        point,
        view,
        factor,
        m.material.normal,
        onlyStroke,
        grayScale,
        onlyStrokeFill,
        font,
        stroke,
        m.material.image.type === "HashImage" && buffers?.[m.material.image.hash]
          ? { type: "svg", svg: buffers[m.material.image.hash]! }
          : m.material.image.type === "UrlImage"
          ? { type: "url", url: m.material.image.url }
          : undefined,
        m.material.imageType as "svg" | "png"
      )
    );
  }
  for (const sg of g.groups) {
    const sPos = vec3TransRot(sg.pos, pos, rot);
    const sRot = vec3RotCombine(rot, sg.rot);
    elements.push(
      ...svgGroup(sg, sPos, sRot, point, view, factor, onlyStroke, grayScale, onlyStrokeFill, font, stroke, buffers)
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
  color: string,
  onlyStroke: boolean,
  grayScale: boolean,
  background: string,
  font: string,
  stroke: number,
  image?: EmbededImage | undefined,
  imageType?: "svg" | "png" | undefined
): ReadonlyArray<zOrderElement> {
  switch (mesh.geometry.type) {
    case "Box":
      return box(mesh.geometry, point, color, onlyStroke, grayScale, stroke, background, parentPos, parentRot);
    case "Plane":
      return plane(
        mesh.geometry,
        point,
        color,
        onlyStroke,
        grayScale,
        stroke,
        background,
        parentPos,
        parentRot,
        view,
        image,
        imageType
      );
    case "Cylinder":
      return cylinder(mesh.geometry, point, color, onlyStroke, grayScale, stroke, background, parentPos, parentRot);
    case "Cone":
      return cone(mesh.geometry, point, color, onlyStroke, grayScale, stroke, background, parentPos, parentRot);
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
