import { createSVG } from "abstract-image";
import {
  Image,
  Vec2,
  Vec3,
  vec2Scale,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
  vec3,
} from "../../../abstract-3d.js";
import { zElem, zOrderElement, SvgOptions } from "./shared.js";
import { svgImage } from "../svg-encoding.js";
import { exhaustiveCheck } from "ts-exhaustive-check";

export function image(
  i: Image,
  point: (x: number, y: number) => Vec2,
  opts: SvgOptions,
  parentPos: Vec3,
  parentRot: Vec3,
): ReadonlyArray<zOrderElement> {
  const half = vec2Scale(i.size, 0.5);
  const pos = vec3TransRot(i.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, i.rot ?? vec3Zero);
  const vec3tr = (x: number, y: number): Vec3 => vec3TransRot(vec3(x, y, 0), pos, rot);

  const v2 = vec3tr(half.x, -half.y);
  const v4 = vec3tr(-half.x, half.y);

  switch(i.image.type) {
    case "AbstractImage": {
      const scale = {
        x: i.size.x / i.image.image.size.width,
        y: i.size.y / i.image.image.size.height,
      };
      const svg = createSVG(i.image.image, opts);
      const img = svgImage(point(v4.x, v4.y), i.size, rot, {
        type: "svg",
        svg,
      }, scale);
      return [zElem(img, (v2.z + v4.z) / 2)];
    }
    default:
      return exhaustiveCheck(i.image.type);
  }
}