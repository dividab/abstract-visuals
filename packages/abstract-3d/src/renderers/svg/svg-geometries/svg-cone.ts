import type { Cone, Vec2, Vec3, Material } from "../../../abstract-3d.js";
import { vec3, vec3TransRot, vec3RotCombine, vec3Zero, vec3ZMean, equals } from "../../../abstract-3d.js";
import { rgbGrayScale } from "../../../utils.js";
import { svgCircle } from "../svg-encoding.js";
import type { zOrderElement, SvgOptions } from "./shared.js";
import { gray, isOpaque, stBW, zElem, transparent } from "./shared.js";

export function cone(
  c: Cone,
  point: (x: number, y: number) => Vec2,
  material: Material,
  opts: SvgOptions,
  parentPos: Vec3,
  parentRot: Vec3
): ReadonlyArray<zOrderElement> {
  const half = vec3(c.radius, c.length / 2, c.radius);
  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, c.rot ?? vec3Zero);

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
  let currentAngle = 0;

  const topPos = vec3TransRot(vec3(0, half.y, 0), pos, rot);
  const botVec3Array = Array<Vec3>();
  for (let i = 0; i <= sides; i++) {
    const currBot = vec3TransRot(vec3(Math.sin(currentAngle) * c.radius, -half.y, Math.cos(currentAngle) * c.radius), pos, rot);
    botVec3Array.push(currBot);
    if (i !== 0) {
      const prevBot = botVec3Array[i - 1]!;
      zOrderComponents.push(zElem("", vec3ZMean(currBot, prevBot, topPos), [currBot, prevBot, topPos], opaque, style));
    }
    currentAngle += angleStep;
  }

  // Add circle if direcly facing camera
  const cylBottom = vec3TransRot(vec3(0, -half.y, 0), pos, rot);
  if (equals(topPos.x, cylBottom.x, 0.1) && equals(topPos.y, cylBottom.y, 0.1)) {
    zOrderComponents.push(
      zElem(svgCircle(c.radius, rot, point(cylBottom.x, cylBottom.y), fill, opacity, stroke, stBW), cylBottom.z, botVec3Array, opaque)
    );
  }

  return zOrderComponents;
}
