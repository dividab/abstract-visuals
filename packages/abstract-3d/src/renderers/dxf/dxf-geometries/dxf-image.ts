import type { AbstractImage, Component } from "abstract-image";
import { type ImageMesh, type Vec3, vec2Scale, vec3, vec3Add, vec3Rot, vec3RotCombine, vec3TransRot, vec3Zero } from "../../../abstract-3d.js";
import { DEFAULT_CIRCLE_SIDE_COUNT, type Handle } from "../dxf-encoding/dxf-common.js";
import { dxfEncLine } from "../dxf-encoding/dxf-line.js";
import { dxfEncLwPolyline } from "../dxf-encoding/dxf-lwpolyline.js";

export function dxfImage(i: ImageMesh, style: string, parentPos: Vec3, parentRot: Vec3, handleRef: Handle): string {
  // A flipped image runs the other way from the opposite corner
  const sign = vec3(i.flip?.x ? -1 : 1, i.flip?.y ? -1 : 1, 1);
  const half = vec2Scale(i.size, 0.5);
  const offset = vec3Rot(vec3(-half.x * sign.x, half.y * sign.y, 0), vec3Zero, i.rot ?? vec3Zero);
  const pos = vec3TransRot(vec3Add(i.pos, offset), parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, i.rot ?? vec3Zero);
  switch (i.image.type) {
    case "AbstractImage": {
      const scale = {
        x: (sign.x * i.size.x) / i.image.image.size.width,
        y: (-sign.y * i.size.y) / i.image.image.size.height,
        z: 1,
      };
      return abstractImageToDxf3D(i.image.image, style, pos, rot, scale, handleRef);
    }
    default:
      return "";
  }
}

function abstractImageToDxf3D(image: AbstractImage, style: string, pos: Vec3, rot: Vec3, scale: Vec3, handleRef: Handle): string {
  return image.components.map((comp) => abstractImageComponentToDxf3D(comp, pos, rot, scale, style, handleRef)).join("");
}

function abstractImageComponentToDxf3D(comp: Component, pos: Vec3, rot: Vec3, scale: Vec3, style: string, handleRef: Handle): string {
  const vec3tr = (x: number, y: number): Vec3 => vec3TransRot(vec3(x * scale.x, y * scale.y, 0), pos, rot);

  let dxf = "";
  switch (comp.type) {
    case "group": {
      dxf += comp.children.map((child) => abstractImageComponentToDxf3D(child, pos, rot, scale, style, handleRef)).join("");
      break;
    }
    case "line": {
      dxf += dxfEncLine(vec3tr(comp.start.x, comp.start.y), vec3tr(comp.end.x, comp.end.y), style, handleRef);
      break;
    }
    case "polyline": {
      const points = comp.points.map((p) => vec3tr(p.x, p.y));
      dxf += dxfEncLwPolyline(pos, points, style, false, handleRef) ?? "";
      break;
    }
    case "polygon": {
      const points = comp.points.map((p) => vec3tr(p.x, p.y));
      dxf += dxfEncLwPolyline(pos, points, style, true, handleRef) ?? "";
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
      dxf += dxfEncLwPolyline(pos, points, style, true, handleRef) ?? "";
      break;
    }
    case "rectangle": {
      const points = [
        //these points form a loop
        vec3tr(comp.topLeft.x, comp.topLeft.y),
        vec3tr(comp.bottomRight.x, comp.topLeft.y),
        vec3tr(comp.bottomRight.x, comp.bottomRight.y),
        vec3tr(comp.topLeft.x, comp.bottomRight.y),
      ];
      dxf += dxfEncLwPolyline(pos, points, style, true, handleRef) ?? "";
      break;
    }
    default:
      break;
  }

  return dxf;
}
