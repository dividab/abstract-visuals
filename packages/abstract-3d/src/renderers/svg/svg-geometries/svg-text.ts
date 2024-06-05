import * as A3D from "../../../abstract-3d";
import { zElem, zOrderElement } from "./shared";
import { svgText } from "../svg-encoding";

export function text(
  t: A3D.Text,
  point: (x: number, y: number) => A3D.Vec2,
  fill: string,
  parentPos: A3D.Vec3,
  parentRot: A3D.Vec3,
  factor: number,
  font: string
): ReadonlyArray<zOrderElement> {
  const pos = A3D.vec3TransRot(t.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, t.rot);
  const texts = Array<zOrderElement>();
  const degrees = A3D.isZero(rot.z, 0.1) ? 0 : rot.z * (-180 / Math.PI);

  const fontSize = t.fontSize * factor;
  const strings = t.text.split("\n");
  let posY = strings.length === 1 ? 0 : (fontSize * strings.length - fontSize) / 2;
  for (const s of strings) {
    texts.push(zElem(svgText(point(pos.x, pos.y + posY), s, degrees, fill, font, fontSize), pos.z));
    posY -= fontSize * 1.2;
  }

  return texts;
}
