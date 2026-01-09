import {
  Plane,
  Vec2,
  Vec3,
  vec2Scale,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
  vec3,
  isZero,
  vec2,
  vec3ZMean,
  Material,
  Hole,
  vec2Add,
  vec2Sub,
} from "../../../abstract-3d.js";
import { gray, black, zElem, zOrderElement, SvgOptions } from "./shared.js";
import { EmbededImage, svgImage, svgPolygon } from "../svg-encoding.js";
import { rgbGrayScale } from "../../shared.js";

export function plane(
  p: Plane,
  point: (x: number, y: number) => Vec2,
  factor: number,
  material: Material,
  opts: SvgOptions,
  parentPos: Vec3,
  parentRot: Vec3,
  holes?: ReadonlyArray<Hole>,
): ReadonlyArray<zOrderElement> {
  const half = vec2Scale(p.size, 0.5);
  const pos = vec3TransRot(p.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, p.rot ?? vec3Zero);
  const vec3tr = (x: number, y: number): Vec3 => vec3TransRot(vec3(x, y, 0), pos, rot);

  const v1 = vec3tr(-half.x, -half.y);
  const v2 = vec3tr(half.x, -half.y);
  const v3 = vec3tr(half.x, half.y);
  const v4 = vec3tr(-half.x, half.y);

  const imageData = material.imageUrl ? opts.imageDataByUrl?.[material.imageUrl] : undefined;
  const image: EmbededImage | undefined = imageData?.startsWith(rawSvgPrefix)
    ? { type: "svg", svg: imageData.slice(rawSvgPrefix.length) }
    : material.imageUrl
      ? { type: "url", url: imageData ?? material.imageUrl }
      : undefined;

  if (image) {
    const size = vec2Scale(p.size, factor);
    const img = svgImage(point(v4.x, v4.y), size, rot, image);
    return [zElem(img, (v2.z + v4.z) / 2)];
  }

  const points = [point(v1.x, v1.y), point(v2.x, v2.y), point(v3.x, v3.y), point(v4.x, v4.y)];

  const [strokeColor, fill, strokeThickness] = opts.onlyStroke
    ? [opts.grayScale ? gray : material.normal, opts.onlyStrokeFill, opts.stroke]
    : [black, opts.grayScale ? rgbGrayScale(material.normal) : material.normal, 0];
  return [zElem(svgPolygon(factor, rot, points, fill, material.opacity ?? 1.0, strokeColor, strokeThickness, holes), vec3ZMean(v1, v2, v3, v4))];
}

const rawSvgPrefix = "data:image/svg+xml,";
