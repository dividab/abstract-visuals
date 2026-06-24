import {
  Plane,
  Vec2,
  Vec3,
  vec2Scale,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
  vec3,
  vec3ZMean,
  Material,
  Hole,
} from "../../../abstract-3d.js";
import { gray, black, zElem, zOrderElement, SvgOptions } from "./shared.js";
import { svgPolygon } from "../svg-encoding.js";
import { rgbGrayScale } from "../../../utils.js";

export function plane(
  p: Plane,
  point: (x: number, y: number) => Vec2,
  material: Material,
  opts: SvgOptions,
  parentPos: Vec3,
  parentRot: Vec3,
  holes?: ReadonlyArray<Hole>
): ReadonlyArray<zOrderElement> {
  const half = vec2Scale(p.size, 0.5);
  const pos = vec3TransRot(p.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, p.rot ?? vec3Zero);
  const vec3tr = (x: number, y: number): Vec3 => vec3TransRot(vec3(x, y, 0), pos, rot);

  const v1 = vec3tr(-half.x, -half.y);
  const v2 = vec3tr(half.x, -half.y);
  const v3 = vec3tr(half.x, half.y);
  const v4 = vec3tr(-half.x, half.y);

  const points = [point(v1.x, v1.y), point(v2.x, v2.y), point(v3.x, v3.y), point(v4.x, v4.y)];

  const [strokeColor, fill, strokeThickness] = opts.only_stroke
    ? [opts.gray_scale ? gray : material.normal, opts.background, opts.stroke_thickness]
    : [black, opts.gray_scale ? rgbGrayScale(material.normal) : material.normal, 0];
  return [
    zElem(
      svgPolygon(rot, points, fill, material.opacity ?? 1.0, strokeColor, strokeThickness, holes),
      vec3ZMean(v1, v2, v3, v4)
    ),
  ];
}
