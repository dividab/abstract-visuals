import { Text, Vec2, Vec3, vec3TransRot, vec3RotCombine, vec3Zero } from "../../../abstract-3d.js";
import { SvgOptions, zElem, zOrderElement } from "./shared.js";
import { svgText } from "../svg-encoding.js";

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
    texts.push(zElem(svgText(point(pos.x, pos.y + posY), s, 0, fill, opts.font, fontSize), pos.z));
    posY -= fontSize * 1.2;
  }

  return texts;
}
