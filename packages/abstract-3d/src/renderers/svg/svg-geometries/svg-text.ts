import type { Text, Vec2, Vec3 } from "../../../abstract-3d.js";
import { vec3TransRot, vec3RotCombine, vec3Zero, vec3, vec3Dot, vec3Rot } from "../../../abstract-3d.js";
import { svgText } from "../svg-encoding.js";
import type { SvgOptions, zOrderElement } from "./shared.js";
import { svgTrsMatrix, zElem } from "./shared.js";

const SVG_FORWARD: Vec3 = vec3(0.0, 0.0, 1.0);

export function text(
  t: Text,
  point: (x: number, y: number) => Vec2,
  fill: string,
  opts: SvgOptions,
  parentPos: Vec3,
  parentRot: Vec3,
  textHeight: number
): ReadonlyArray<zOrderElement> {
  const pos = vec3TransRot(t.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, t.rot ?? vec3Zero);

  const textForward = vec3Rot({ x: 0, y: 0, z: 1 }, vec3Zero, rot);

  // Only its front side is drawn, as in the viewer: seen from behind, or edge on, it's left out
  if (vec3Dot(textForward, SVG_FORWARD) <= 0) {
    return [];
  }

  const texts = Array<zOrderElement>();
  const fontSize = t.fontSize ?? textHeight;
  const strings = t.text.split("\n");
  let posY = strings.length === 1 ? 0 : (fontSize * strings.length - fontSize) / 2;
  for (const s of strings) {
    if (s.trim()) {
      const matrix = svgTrsMatrix(point(pos.x, pos.y + posY), rot);
      texts.push(zElem(svgText(s, matrix, fill, opts.font, fontSize), pos.z, [pos]));
    }
    posY -= fontSize * 1.2;
  }

  return texts;
}
