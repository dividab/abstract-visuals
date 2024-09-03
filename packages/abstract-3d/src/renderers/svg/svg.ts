import { exhaustiveCheck } from "ts-exhaustive-check";
import * as A3D from "../../abstract-3d";
import { zOrderElement } from "./svg-geometries/shared";
import { box } from "./svg-geometries/svg-box";
import { cylinder } from "./svg-geometries/svg-cylinder";
import { line } from "./svg-geometries/svg-line";
import { plane } from "./svg-geometries/svg-plane";
import { shape } from "./svg-geometries/svg-shape";
import { polygon } from "./svg-geometries/svg-polygon";
import { text } from "./svg-geometries/svg-text";
import { cone } from "./svg-geometries/svg-cone";
import { rotationForCameraPos, sizeForCameraPos } from "../shared";
import { EmbededImage, svg } from "./svg-encoding";

export function toSvg(
  scene: A3D.Scene,
  view: A3D.View,
  stroke: number,
  scale?: { readonly size: number; readonly scaleByWidth: boolean },
  onlyStroke?: boolean,
  grayScale?: boolean,
  onlyStrokeFill: string = "rgba(255,255,255,0)",
  font: string = "",
  buffers?: Record<string, string>
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
  const unitRot = A3D.vec3RotCombine(rotationForCameraPos(view), scene.rotation_deprecated ?? A3D.vec3Zero);
  const unitPos = A3D.vec3Rot(
    scene.center_deprecated ?? A3D.vec3Zero,
    A3D.vec3Zero,
    scene.rotation_deprecated ?? A3D.vec3Zero
  );
  const size = sizeForCameraPos(scene.size_deprecated, unitPos, unitRot);

  const elements = Array<zOrderElement>();
  const point = (x: number, y: number): A3D.Vec2 =>
    A3D.vec2(
      (-unitPos.x + size.x * 0.5 + x) * factor - stroke * 0.75,
      (unitPos.y + size.y - y) * factor + stroke * 0.75
    );
  for (const g of scene.groups) {
    elements.push(
      ...svgGroup(
        g,
        unitPos,
        unitRot,
        point,
        view,
        factor,
        onlyStroke,
        grayScale,
        onlyStrokeFill,
        font,
        stroke,
        buffers
      )
    );
  }
  elements.sort((a, b) => a.zOrder - b.zOrder);
  const cameraPos = A3D.vec3Rot(A3D.vec3(1, 1, 1), A3D.vec3Zero, scene.rotation_deprecated ?? A3D.vec3Zero);
  for (const d of scene.dimensions_deprecated?.dimensions ?? []) {
    if (flipViews(d.views[0], cameraPos) === view) {
      const pos = A3D.vec3TransRot(d.pos, unitPos, unitRot);
      const rot = A3D.vec3RotCombine(unitRot, d.rot);
      for (const m of d.meshes) {
        elements.push(
          ...svgMesh(
            m,
            pos,
            rot,
            point,
            view,
            factor,
            scene.dimensions_deprecated?.material.normal ?? "",
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

  const width = size.x * factor + 1.5 * stroke;
  const height = size.y * factor + 1.5 * stroke;

  const image = svg(
    width,
    height,
    elements.reduce((a, { element }) => `${a} ${element}`, "")
  );
  return { image, width, height };
}

function svgGroup(
  g: A3D.Group,
  parentPos: A3D.Vec3,
  parentRot: A3D.Vec3,
  point: (x: number, y: number) => A3D.Vec2,
  view: A3D.View,
  factor: number,
  onlyStroke: boolean | undefined,
  grayScale: boolean | undefined,
  onlyStrokeFill: string,
  font: string,
  stroke: number,
  buffers?: Record<string, string>
): ReadonlyArray<zOrderElement> {
  const elements = Array<zOrderElement>();
  const pos = A3D.vec3TransRot(g.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, g.rot ?? A3D.vec3Zero);

  for (const m of g.meshes ?? []) {
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
        m.material.image?.type === "HashImage" && buffers?.[m.material.image.hash]
          ? { type: "svg", svg: buffers[m.material.image.hash]! }
          : m.material.image?.type === "UrlImage"
          ? { type: "url", url: m.material.image.url }
          : undefined
      )
    );
  }
  for (const sg of g.groups ?? []) {
    elements.push(
      ...svgGroup(sg, pos, rot, point, view, factor, onlyStroke, grayScale, onlyStrokeFill, font, stroke, buffers)
    );
  }
  return elements;
}

function svgMesh(
  mesh: A3D.Mesh,
  parentPos: A3D.Vec3,
  parentRot: A3D.Vec3,
  point: (x: number, y: number) => A3D.Vec2,
  view: A3D.View,
  factor: number,
  color: string,
  onlyStroke: boolean | undefined,
  grayScale: boolean | undefined,
  background: string,
  font: string,
  stroke: number,
  image?: EmbededImage | undefined
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
        image
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

const flipViews = (v: A3D.View | undefined, pos: A3D.Vec3): A3D.View | undefined => {
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
