import type { Cylinder, Vec2, Vec3, Material } from "../../../abstract-3d.js";
import { vec3, vec3TransRot, vec3RotCombine, vec3Zero, vec3ZMean, equals } from "../../../abstract-3d.js";
import { rgbGrayScale } from "../../../utils.js";
import { svgCircle } from "../svg-encoding.js";
import type { SvgOptions, zOrderElement } from "./shared.js";
import { getArea, gray, isOpaque, minArea, stBW, transparent, zElem } from "./shared.js";

export function cylinder(
  c: Cylinder,
  point: (x: number, y: number) => Vec2,
  material: Material,
  opts: SvgOptions,
  parentPos: Vec3,
  parentRot: Vec3
): ReadonlyArray<zOrderElement> {
  const half = c.length / 2;
  const radiusEnd = c.radiusEnd ?? c.radius;
  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, c.rot ?? vec3Zero);

  const color = material.normal;
  const opacity = material.opacity ?? 1.0;
  const [stroke, fill] = opts.only_stroke
    ? [opts.gray_scale ? gray : color, opts.background]
    : [transparent, opts.gray_scale ? rgbGrayScale(color) : color];
  const opaque = isOpaque(fill, opacity);
  const style = { fill, opacity, stroke, strokeWidth: stBW };
  // A closed opaque cylinder's facets turned away are hidden by those toward the viewer and its near end
  const cullBack = opaque && !c.open;
  const circleTop = vec3TransRot(vec3(0, half, 0), pos, rot);
  const circleBottom = vec3TransRot(vec3(0, -half, 0), pos, rot);
  const facing = equals(circleTop.x, circleBottom.x, 0.1) && equals(circleTop.y, circleBottom.y, 0.1);
  // Closed, without holes, and not seen as its end's circle, drawn natively where nothing is drawn between its facets
  const rings = [
    { center: circleBottom, radius: c.radius },
    { center: circleTop, radius: radiusEnd },
  ];
  const native = c.open || c.holes?.length || facing ? undefined : { rings, style };
  const zOrderComponents = Array<zOrderElement>();

  const sides = 8;
  const angleStep = (2 * Math.PI) / sides;
  let currentAngle = 0;

  const botVec3Array = Array<Vec3>();
  const topVec3Array = Array<Vec3>();
  for (let i = 0; i <= sides; i++) {
    const sin = Math.sin(currentAngle);
    const cos = Math.cos(currentAngle);
    const currBot = vec3TransRot(vec3(sin * c.radius, -half, cos * c.radius), pos, rot);
    const currTop = vec3TransRot(vec3(sin * radiusEnd, half, cos * radiusEnd), pos, rot);
    botVec3Array.push(currBot);
    topVec3Array.push(currTop);
    const mid = currentAngle - angleStep / 2;
    if (i !== 0 && !(cullBack && vec3TransRot(vec3(Math.sin(mid), 0, Math.cos(mid)), vec3Zero, rot).z < -1e-6)) {
      const polygon = [currBot, botVec3Array[i - 1]!, topVec3Array[i - 1]!, currTop];
      // Seen edge on, a closed cylinder's facet is only a line along its end
      if (c.open || Math.abs(getArea(polygon)) >= minArea) {
        zOrderComponents.push(zElem("", vec3ZMean(...polygon), polygon, opaque, style, native));
      }
    }
    currentAngle += angleStep;
  }
  if (!c.open) {
    // The near end: a circle when directly facing the camera, else seen at an angle, its ring of facet corners
    const [circlePos, circleRadius, ring] =
      circleTop.z > circleBottom.z ? [circleTop, radiusEnd, topVec3Array] : [circleBottom, c.radius, botVec3Array];
    if (facing) {
      const holes = radiusEnd === c.radius ? c.holes : undefined;
      // Its holes are in its end's plane, its x and z, as the viewer cuts them
      zOrderComponents.push(
        zElem(
          svgCircle(circleRadius, vec3RotCombine(rot, vec3(Math.PI / 2, 0, 0)), point(circlePos.x, circlePos.y), fill, opacity, stroke, stBW, holes),
          circlePos.z,
          ring,
          opaque && !holes?.length
        )
      );
    } else if (Math.abs(getArea(ring)) >= minArea) {
      // Not seen edge on, when it's only a line along the facets' edges
      zOrderComponents.push(zElem("", circlePos.z, ring, opaque && !c.holes?.length, style, native));
    }
  }
  return zOrderComponents;
}
