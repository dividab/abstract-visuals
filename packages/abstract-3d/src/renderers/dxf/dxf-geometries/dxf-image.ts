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
  vec3Sub,
  vec3Normalize,
  vec3Cross,
  vec3Scale,
} from "../../../abstract-3d.js";
import { dxf3DFACE, dxfHandle, Handle } from "../dxf-encoding.js";
import { dxfPlane } from "./dxf-plane.js";

export function dxfImage(i: Image, parentPos: Vec3, parentRot: Vec3, handleRef: Handle): string {

  const half = vec2Scale(i.size, 0.5);
  const offset = vec3Rot(vec3(-half.x, half.y, 0), vec3Zero, i.rot ?? vec3Zero);
  const pos = vec3TransRot(vec3Add(i.pos, offset), parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, i.rot ?? vec3Zero);

  switch(i.image.type) {
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

  let dxf = "";

  //create the background and place it slightly below the stroke elements
  // const normal = eulerToVector(rot);
  // const bgSize = { x: image.size.width * scale.x, y: image.size.height * scale.y, z: 1 };
  // const bgHalf = vec3Rot(vec3Scale(bgSize, 0.5), vec3Zero, rot);
  // const bgPos = vec3Add(vec3Add(pos, bgHalf), vec3Scale(normal, -1));
  // dxf += dxfPlane({
  //   type: "Plane",
  //   size: bgSize,
  //   pos: bgPos,
  //   rot,
  // }, {normal: `normal(0, 0, 1)`}, vec3Zero, vec3Zero, handleRef);

  for(const comp of image.components) {
    dxf += abstractImageComponentToDxf3D(comp, pos, rot, scale, strokeScale, handleRef);    
  }
  return dxf;
}

function abstractImageComponentToDxf3D(comp: Component, pos: Vec3, rot: Vec3, scale: Vec3, strokeScale: number, handleRef: Handle): string {
  const vec3tr = (x: number, y: number): Vec3 => vec3TransRot(vec3(x * scale.x, y * scale.y, 0), pos, rot);
  const strokeColor: Color = { a: 255.0, r: 0.0, g: 0.0, b: 0.0 };

  let dxf = "";
  switch(comp.type) {
    case "group": {
      for(const child of comp.children) {
        dxf += abstractImageComponentToDxf3D(child, pos, rot, scale, strokeScale, handleRef);
      }
      break;
    }
    case "line": {
      dxf += dxfLine(vec3tr(comp.start.x, comp.start.y), vec3tr(comp.end.x, comp.end.y), strokeColor, comp.strokeThickness * strokeScale, rot, handleRef);
      break;
    }
    case "polyline": {
      const points = comp.points.map((p) => vec3tr(p.x, p.y));
      dxf += dxfPolyline(points, strokeColor, false, comp.strokeThickness * strokeScale, rot, handleRef);
      break;
    }
    case "polygon": {
      const points = comp.points.map((p) => vec3tr(p.x, p.y));
      dxf += dxfPolyline(points, strokeColor, true, comp.strokeThickness * strokeScale, rot, handleRef);
      break;
    }
    case "ellipse": {
      const points: Array<Vec3> = [];
      const r1 = Math.abs(comp.bottomRight.x - comp.topLeft.x) / 2.0;
      const r2 = Math.abs(comp.topLeft.y - comp.bottomRight.y) / 2.0;
      const numPoints = 32;
      for (let i = 0; i < numPoints; i++) {
        const t = (2 * Math.PI * i) / numPoints;
        const x = comp.topLeft.x + r1 + r1 * Math.cos(t);
        const y = comp.topLeft.y + r2 + r2 * Math.sin(t);
        points.push(vec3tr(x, y));
      }
      dxf += dxfPolyline(points, strokeColor, true, comp.strokeThickness * strokeScale, rot, handleRef);
      break;
    }
    case "rectangle": {
      const size = {
        x: comp.bottomRight.x - comp.topLeft.x,
        y: comp.bottomRight.y - comp.topLeft.y
      };
      const points = [
        vec3tr(0, 0),
        vec3tr(size.x, 0),
        vec3tr(size.x, size.y),
        vec3tr(0, size.y),
      ];
      dxf += dxfPolyline(points, strokeColor, true, comp.strokeThickness * strokeScale, rot, handleRef);
      break;
    }
    default:
      break;
  }

  return dxf;
}

function dxfLine(vecStart: Vec3, vecEnd: Vec3, color: Color, strokeThickness: number, normal: Vec3, handleRef: Handle): string {
  const norm = eulerToVector(normal);
  strokeThickness = 0;

  const dir = vec3Normalize(vec3Sub(vecEnd, vecStart));
  const right = vec3Cross(dir, norm);
  const s1 = vec3Add(vecStart, vec3Scale(right, strokeThickness / 2));
  const s2 = vec3Add(vecStart, vec3Scale(right, -strokeThickness / 2));
  const e1 = vec3Add(vecEnd, vec3Scale(right, strokeThickness / 2));
  const e2 = vec3Add(vecEnd, vec3Scale(right, -strokeThickness / 2));
  //return dxf3DFACE(s1, e1, e2, s2, abstractImageColorToHex(color), handleRef);
  return dxf3DFACE(s1, e1, e2, s2, 7, handleRef);
}

function dxfPolyline(points: ReadonlyArray<Vec3>, color: Color, closed: boolean, strokeThickness: number, normal: Vec3, handleRef: Handle): string {
  let dxf = "";
  for(let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i+1];
    if(!p1 || !p2) {
      continue;
    }
    dxf += dxfLine(p1, p2, color, strokeThickness, normal, handleRef);
  }
  if(closed) {
    const start = points[0];
    const end = points[points.length - 1];
    if(start && end) {
      dxf += dxfLine(start, end, color, strokeThickness, normal, handleRef);
    }
  }
  return dxf;
}

function abstractImageColorToHex(color: Color): string {
  const col = `rgb(${color.r}, ${color.g}, ${color.b})`;
  return col;
}

function eulerToVector(euler: Vec3): Vec3 {
  const cx = Math.cos(euler.x);
  const sx = Math.sin(euler.x);
  const cy = Math.cos(euler.y);
  const sy = Math.sin(euler.y);
  //const cz = Math.cos(euler.z); ?
  //const sz = Math.sin(euler.z); ?
  const norm = {
    x: sy,
    y: -sx * cy,
    z: cx * cy
  };
  return norm;
}