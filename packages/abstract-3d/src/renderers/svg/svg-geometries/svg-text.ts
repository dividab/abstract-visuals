import { Text, Vec2, Vec3, vec3TransRot, vec3RotCombine, vec3Zero, isZero, vec3, vec3Dot, View, vec3Rot } from "../../../abstract-3d.js";
import { SvgOptions, zElem, zOrderElement } from "./shared.js";
import { svgText } from "../svg-encoding.js";
import { rotationForCameraPos } from "../../shared.js";

// dummy
export function text(
  t: Text,
  point: (x: number, y: number) => Vec2,
  fill: string,
  opts: SvgOptions,
  parentPos: Vec3,
  parentRot: Vec3,
  factor: number
): ReadonlyArray<zOrderElement> {
  const pos = vec3TransRot(t.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, t.rot ?? vec3Zero);
  const texts = Array<zOrderElement>();
  const fontSize = t.fontSize * factor;
  const strings = t.text.split("\n");
  let posY = strings.length === 1 ? 0 : (fontSize * strings.length - fontSize) / 2;
  for (const s of strings) {
    const svgMatrix = eulerToSvgMatrix(rot, point(pos.x, pos.y + posY));
    texts.push(zElem(svgText(s, svgMatrix, fill, opts.font, fontSize), pos.z));
    posY -= fontSize * 1.2;
  }

  return texts;
}

function eulerToSvgMatrix(rot: Vec3, pos: Vec2): string {
  const rx = rot.x;
  const ry = rot.y;
  const rz = rot.z;
  
  const cx = Math.cos(rx);
  const cy = Math.cos(ry);
  const cz = Math.cos(rz);
  const sx = Math.sin(rx);
  const sy = Math.sin(ry);
  const sz = Math.sin(rz);

  const rotate3D = (v: Vec3): Vec3 => {
    return {
      x: v.x * (cy * cz) + v.y * (-cy * sz) + v.z * (sy),
      y: v.x * (sx * sy * cz + cx * sz) + v.y * (-sx * sy * sz + cx * cz) + v.z * (-sx * cy),
      z: v.x * (-cx * sy * cz + sx * sz) + v.y * (cx * sy * sz + sx * cz) + v.z * (cx * cy),
    };
  };

  const xRot = rotate3D({ x: 1, y: 0, z: 0 });
  const yRot = rotate3D({ x: 0, y: -1, z: 0 });

  const x2D = { x: xRot.x, y: -xRot.y };
  const y2D = { x: yRot.x, y: -yRot.y };

  const lenX = Math.hypot(x2D.x, x2D.y);
  const lenY = Math.hypot(y2D.x, y2D.y);
  let xN = { x: x2D.x / lenX, y: x2D.y / lenX };
  let yN = { x: y2D.x / lenY, y: y2D.y / lenY };

  const a = xN.x * lenX;
  const b = xN.y * lenX;
  const c = yN.x * lenY;
  const d = yN.y * lenY;
  const e = pos.x;
  const f = pos.y;

  return `matrix(${a} ${b} ${c} ${d} ${e} ${f})`;
}