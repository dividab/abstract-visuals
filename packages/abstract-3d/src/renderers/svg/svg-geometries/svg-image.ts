import { createSVG } from "abstract-image";
import { exhaustiveCheck } from "ts-exhaustive-check";
import type { ImageMesh, Vec2, Vec3 } from "../../../abstract-3d.js";
import { vec2, vec2Scale, vec3TransRot, vec3RotCombine, vec3Zero, vec3 } from "../../../abstract-3d.js";
import type { EmbededImage } from "../svg-encoding.js";
import { rawSvgPrefix, svgImage } from "../svg-encoding.js";
import type { zOrderElement, SvgOptions } from "./shared.js";
import { getArea, minArea, zElem } from "./shared.js";

export function image(
  i: ImageMesh,
  point: (x: number, y: number) => Vec2,
  opts: SvgOptions,
  parentPos: Vec3,
  parentRot: Vec3
): ReadonlyArray<zOrderElement> {
  const half = vec2Scale(i.size, 0.5);
  const pos = vec3TransRot(i.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, i.rot ?? vec3Zero);
  const v2 = vec3TransRot(vec3(half.x, -half.y, 0), pos, rot);
  const v4 = vec3TransRot(vec3(-half.x, half.y, 0), pos, rot);
  const corners = [vec3TransRot(vec3(-half.x, -half.y, 0), pos, rot), v2, vec3TransRot(vec3(half.x, half.y, 0), pos, rot), v4];
  // Seen edge on, it can't be seen, and isn't loaded
  if (Math.abs(getArea(corners)) < minArea) {
    return [];
  }
  // A flipped image runs the other way from the opposite corner
  const sign = vec2(i.flip?.x ? -1 : 1, i.flip?.y ? -1 : 1);
  const topLeft = vec3TransRot(vec3(-half.x * sign.x, half.y * sign.y, 0), pos, rot);

  switch (i.image.type) {
    case "AbstractImage": {
      const scale = {
        x: (sign.x * i.size.x) / i.image.image.size.width,
        y: (sign.y * i.size.y) / i.image.image.size.height,
      };
      // Within a tenth of a unit, finer than the svg's own whole units so that its parts line up as drawn
      const decimals = Math.max(0, Math.ceil(Math.log10(10 * Math.max(Math.abs(scale.x), Math.abs(scale.y)) || 1)));
      const svg = createSVG(i.image.image, { ...opts, decimals, namespace: false });
      const img = svgImage(point(topLeft.x, topLeft.y), i.size, rot, { type: "svg", svg }, opts.imageBg ? opts.background : undefined, scale);
      return [zElem(img, (v2.z + v4.z) / 2, corners)];
    }
    case "Url": {
      const imageData = opts.imageDataByUrl[i.image.url];
      const image: EmbededImage | undefined = imageData?.startsWith(rawSvgPrefix)
        ? {
            type: "svg",
            svg: decodeURIComponent(imageData.slice(rawSvgPrefix.length)).replace(/^\s*(<\?xml[^>]*\?>\s*)?(<!DOCTYPE[^>]*>\s*)?/i, ""),
          }
        : i.image.url
          ? { type: "url", url: imageData ?? i.image.url }
          : undefined;

      if (image) {
        const img = svgImage(point(topLeft.x, topLeft.y), i.size, rot, image, opts.imageBg ? opts.background : undefined, sign);
        return [zElem(img, (v2.z + v4.z) / 2, corners)];
      }
      return [];
    }
    default:
      return exhaustiveCheck(i.image);
  }
}
