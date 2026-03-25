import type { AbstractImage, Color, Component } from "abstract-image";
import {
  Image,
  Vec3,
  vec2Scale,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
  vec3,
  vec3Rot,
  vec3Add,
} from "../../../abstract-3d.js";
import { DEFAULT_CIRCLE_SIDE_COUNT, DxfDynamicColor, dxfLine, dxfPolyline, Handle } from "../dxf-encoding.js";

export function dxfImage(i: Image, parentPos: Vec3, parentRot: Vec3, handleRef: Handle): string {
  const half = vec2Scale(i.size, 0.5);
  const offset = vec3Rot(vec3(-half.x, half.y, 0), vec3Zero, i.rot ?? vec3Zero);
  const pos = vec3TransRot(vec3Add(i.pos, offset), parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, i.rot ?? vec3Zero);
  switch (i.image.type) {
    case "AbstractImage": {
      const scale = {
        x: i.size.x / i.image.image.size.width,
        y: -i.size.y / i.image.image.size.height,
        z: 1,
      };
      return abstractImageToDxf3D(i.image.image, pos, rot, scale, handleRef);
    }
    default:
      return "";
  }
}

function abstractImageToDxf3D(image: AbstractImage, pos: Vec3, rot: Vec3, scale: Vec3, handleRef: Handle): string {
  const strokeScale = Math.max(scale.x, scale.y, scale.z);
  return image.components.map(
    (comp) =>
      abstractImageComponentToDxf3D(comp, pos, rot, scale, strokeScale, handleRef)
  ).join("");
}

function abstractImageComponentToDxf3D(comp: Component, pos: Vec3, rot: Vec3, scale: Vec3, strokeScale: number, handleRef: Handle): string {
  const vec3tr = (x: number, y: number): Vec3 => vec3TransRot(vec3(x * scale.x, y * scale.y, 0), pos, rot);
  const strokeColor: DxfDynamicColor = 7;

  let dxf = "";
  switch (comp.type) {
    case "group": {
      dxf += comp.children.map(
        (child) =>
          abstractImageComponentToDxf3D(child, pos, rot, scale, strokeScale, handleRef)
      ).join("");
      break;

    }
    case "line": {
      dxf += dxfLine(
        vec3tr(comp.start.x, comp.start.y),
        vec3tr(comp.end.x, comp.end.y),
        strokeColor,
        handleRef
      );
      break;
    }
    case "polyline": {
      const points = comp.points.map((p) => vec3tr(p.x, p.y));
      dxf += dxfPolyline(points, strokeColor, false, handleRef);
      break;
    }
    case "polygon": {
      const points = comp.points.map((p) => vec3tr(p.x, p.y));
      dxf += dxfPolyline(points, strokeColor, true, handleRef);
      break;
    }
    case "ellipse": {
      const points: Array<Vec3> = [];
      const r1 = Math.abs(comp.bottomRight.x - comp.topLeft.x) / 2.0;
      const r2 = Math.abs(comp.topLeft.y - comp.bottomRight.y) / 2.0;
      for (let i = 0; i < DEFAULT_CIRCLE_SIDE_COUNT; i++) {
        const t = (2 * Math.PI * i) / DEFAULT_CIRCLE_SIDE_COUNT;
        const x = comp.topLeft.x + r1 + r1 * Math.cos(t);
        const y = comp.topLeft.y + r2 + r2 * Math.sin(t);
        points.push(vec3tr(x, y));
      }
      dxf += dxfPolyline(points, strokeColor, true, handleRef);
      break;
    }
    case "rectangle": {
      const size = {
        x: comp.bottomRight.x - comp.topLeft.x,
        y: comp.bottomRight.y - comp.topLeft.y
      };
      const points = [ //these points form a loop
        vec3tr(0, 0),
        vec3tr(size.x, 0),
        vec3tr(size.x, size.y),
        vec3tr(0, size.y),
      ];
      dxf += dxfPolyline(points, strokeColor, true, handleRef);
      break;
    }
    default:
      break;
  }

  return dxf;
}