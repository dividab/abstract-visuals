import type { Lathe, Vec2, Vec3, Material } from "../../../abstract-3d.js";
import { vec3, vec3TransRot, vec3RotCombine, vec3Zero, vec3ZMean, equals, isZero } from "../../../abstract-3d.js";
import { rgbGrayScale } from "../../../utils.js";
import { svgCircle, svgPolygon } from "../svg-encoding.js";
import type { SvgOptions, zOrderElement } from "./shared.js";
import { gray, stBW, transparent, zElem } from "./shared.js";

/**
 * Its profile turned like a cylinder's sides, a ring of facet corners at each point, so it's one solid without faces inside; its end nearer the
 * camera closed while off the axis
 */
export function lathe(
  l: Lathe,
  point: (x: number, y: number) => Vec2,
  material: Material,
  opts: SvgOptions,
  parentPos: Vec3,
  parentRot: Vec3
): ReadonlyArray<zOrderElement> {
  const pos = vec3TransRot(l.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, l.rot ?? vec3Zero);

  const color = material.normal;
  const opacity = material.opacity ?? 1.0;
  const [stroke, fill] = opts.only_stroke
    ? [opts.stroke_color || (opts.gray_scale ? gray : color), opts.background]
    : [transparent, opts.gray_scale ? rgbGrayScale(color) : color];
  const zOrderComponents = Array<zOrderElement>();

  const sides = 8;
  const angleStep = (2 * Math.PI) / sides;
  const rings = l.points.map((p) =>
    Array.from({ length: sides + 1 }, (_, i) => vec3TransRot(vec3(Math.sin(i * angleStep) * p.x, p.y, Math.cos(i * angleStep) * p.x), pos, rot))
  );
  for (let r = 1; r < rings.length; r++) {
    const [bot, top] = [rings[r - 1]!, rings[r]!];
    // Not a side along the axis
    if (!isZero(l.points[r - 1]!.x) || !isZero(l.points[r]!.x)) {
      for (let i = 1; i <= sides; i++) {
        const [currBot, prevBot, prevTop, currTop] = [bot[i]!, bot[i - 1]!, top[i - 1]!, top[i]!];
        const points = [point(currBot.x, currBot.y), point(prevBot.x, prevBot.y), point(prevTop.x, prevTop.y), point(currTop.x, currTop.y)];
        zOrderComponents.push(zElem(svgPolygon(rot, points, fill, opacity, stroke, stBW), vec3ZMean(currBot, prevBot, currTop, prevTop)));
      }
    }
  }

  const [first, last] = [l.points[0], l.points[l.points.length - 1]];
  if (first && last) {
    // The end nearer the camera, a circle when directly facing it, like a cylinder's
    const firstCenter = vec3TransRot(vec3(0, first.y, 0), pos, rot);
    const lastCenter = vec3TransRot(vec3(0, last.y, 0), pos, rot);
    const [center, radius] = firstCenter.z > lastCenter.z ? [firstCenter, first.x] : [lastCenter, last.x];
    if (!isZero(radius) && equals(firstCenter.x, lastCenter.x, 0.1) && equals(firstCenter.y, lastCenter.y, 0.1)) {
      zOrderComponents.push(zElem(svgCircle(radius, rot, point(center.x, center.y), fill, opacity, stroke, stBW), center.z));
    }
  }
  return zOrderComponents;
}
