import { Curve, Path, type Shape, Vector3 } from "three";
import { exhaustiveCheck } from "ts-exhaustive-check";
import type { CircleCurve as A3dCircleCurve, Hole, Vec3 } from "../../abstract-3d.js";
import { vec2Scale, vec2Sub, vec2Add, vec3, equals } from "../../abstract-3d.js";

/** Three.js geometry helpers shared by the react renderer and the triangulating exporters */

export const CYLINDER_SEGMENTS = 40;

export function holeIsZero(hole: Hole): boolean {
  switch (hole.type) {
    case "RoundHole": {
      return equals(hole.radius, 0.0);
    }
    case "SquareHole": {
      return equals(hole.size.x, 0.0) || equals(hole.size.y, 0.0);
    }
    default:
      return false;
  }
}

export function nonZeroHoles(holes: ReadonlyArray<Hole> | undefined): ReadonlyArray<Hole> {
  return holes?.filter((h) => !holeIsZero(h)) ?? [];
}

export function addHoles(holes: ReadonlyArray<Hole> | undefined, shape: Shape): void {
  nonZeroHoles(holes).forEach((h) => {
    switch (h.type) {
      case "RoundHole":
        shape.holes.push(new Path().absarc(h.pos.x, h.pos.y, h.radius, 0, Math.PI * 2, true));
        break;
      case "SquareHole": {
        const path = new Path();
        const halfHole = vec2Scale(h.size, 0.5);
        const min = vec2Sub(h.pos, halfHole);
        const max = vec2Add(h.pos, halfHole);
        path.moveTo(min.x, min.y).lineTo(min.x, max.y).lineTo(max.x, max.y).lineTo(max.x, min.y).closePath();
        shape.holes.push(path);
        break;
      }
      default:
        exhaustiveCheck(h);
    }
  });
}

const rimPoint = (radius: number, y: number, angle: number): Vec3 => vec3(radius * Math.sin(angle), y, radius * Math.cos(angle));

/** Flat xyz positions of the two walls closing an angled cylinder, from the axis out to the rim at angleStart and angleEnd */
export function cylinderCutPositions(top: number, bottom: number, length: number, angleStart: number, angleLength: number): ReadonlyArray<number> {
  const half = length / 2;
  const [c0, c1] = [vec3(0, -half, 0), vec3(0, half, 0)];
  const angleEnd = angleStart + angleLength;
  const [b0, t0] = [rimPoint(bottom, -half, angleStart), rimPoint(top, half, angleStart)];
  const [b1, t1] = [rimPoint(bottom, -half, angleEnd), rimPoint(top, half, angleEnd)];
  // Unshared vertices so each wall gets its own flat normal, wound opposite so both face outwards
  const triangles = [
    [c0, b0, t0],
    [c0, t0, c1],
    [c0, c1, t1],
    [c0, t1, b1],
  ];
  return triangles.flat().flatMap((v) => [v.x, v.y, v.z]);
}

// oxlint-disable-next-line functional/no-classes -- extends three.js Curve, which requires a class
export class CircleCurve extends Curve<Vector3> {
  radius: number;
  angleLength: number;
  startAngle: number;

  constructor(circleCurve: A3dCircleCurve) {
    super();
    this.radius = circleCurve.radius;
    this.startAngle = circleCurve.angleStart;
    this.angleLength = circleCurve.angleLength;
  }

  override getPoint(t: number, optionalTarget = new Vector3()): Vector3 {
    return optionalTarget.set(
      -this.radius * Math.sin(this.startAngle + this.angleLength * t),
      -this.radius * Math.cos(this.startAngle + this.angleLength * t),
      0
    );
  }
}
