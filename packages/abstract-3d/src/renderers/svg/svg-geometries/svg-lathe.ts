import type { Lathe, Vec2, Vec3, Material } from "../../../abstract-3d.js";
import { vec3, vec3TransRot, vec3RotCombine, vec3Zero, vec3ZMean, equals, isZero } from "../../../abstract-3d.js";
import { rgbGrayScale } from "../../../utils.js";
import { svgCircle } from "../svg-encoding.js";
import type { SvgOptions, zOrderElement } from "./shared.js";
import { getArea, gray, isOpaque, minArea, stBW, transparent, zElem } from "./shared.js";

/**
 * Its profile turned like a cylinder's sides, a ring of facet corners at each point, so it's one solid without faces inside; its end nearer the
 * camera closed while off the axis. Its facets not culled, a step across the axis facing along it, not out like a cylinder's, the ordering hiding
 * them
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
    ? [opts.gray_scale ? gray : color, opts.background]
    : [transparent, opts.gray_scale ? rgbGrayScale(color) : color];
  const opaque = isOpaque(fill, opacity);
  const style = { fill, opacity, stroke, strokeWidth: stBW };
  const zOrderComponents = Array<zOrderElement>();

  const sides = 8;
  const angleStep = (2 * Math.PI) / sides;
  const rings: Array<ReadonlyArray<Vec3>> = [];
  for (const p of l.points) {
    const ring: Array<Vec3> = [];
    for (let i = 0; i <= sides; i++) {
      ring.push(vec3TransRot(vec3(Math.sin(i * angleStep) * p.x, p.y, Math.cos(i * angleStep) * p.x), pos, rot));
    }
    rings.push(ring);
  }
  for (let r = 1; r < rings.length; r++) {
    const [bot, top] = [rings[r - 1]!, rings[r]!];
    // Not a side along the axis
    if (!isZero(l.points[r - 1]!.x) || !isZero(l.points[r]!.x)) {
      for (let i = 1; i <= sides; i++) {
        const polygon = [bot[i]!, bot[i - 1]!, top[i - 1]!, top[i]!];
        zOrderComponents.push(zElem("", vec3ZMean(...polygon), polygon, opaque, style));
      }
    }
  }

  const [first, last] = [l.points[0], l.points[l.points.length - 1]];
  if (first && last) {
    // The end nearer the camera: a circle when directly facing it, else seen at an angle, its ring of facet corners, like a cylinder's
    const firstCenter = vec3TransRot(vec3(0, first.y, 0), pos, rot);
    const lastCenter = vec3TransRot(vec3(0, last.y, 0), pos, rot);
    const [center, radius, ring] = firstCenter.z > lastCenter.z ? [firstCenter, first.x, rings[0]!] : [lastCenter, last.x, rings[rings.length - 1]!];
    if (!isZero(radius)) {
      if (equals(firstCenter.x, lastCenter.x, 0.1) && equals(firstCenter.y, lastCenter.y, 0.1)) {
        zOrderComponents.push(zElem(svgCircle(radius, rot, point(center.x, center.y), fill, opacity, stroke, stBW), center.z, ring, opaque));
      } else if (Math.abs(getArea(ring)) >= minArea) {
        // Not seen edge on, when it's only a line along the facets' edges
        zOrderComponents.push(zElem("", center.z, ring, opaque, style));
      }
    }
  }
  return zOrderComponents;
}
