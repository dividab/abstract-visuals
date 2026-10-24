import type { Vec3 } from "../../abstract-3d.js";
import type { zOrderElement } from "./svg-geometries/shared.js";

/**
 * Elements in drawing order, back to front, by Newell's ordering without splitting: of two elements that overlap on screen, one entirely behind the
 * other's plane, or the other entirely in front of its plane, is drawn first. Elements are drawn by mean depth otherwise, each after those it must be
 * drawn after, depth first; elements overlapping in a cycle, which only splitting them could resolve, are drawn where the cycle is met. Elements
 * entirely inside an opaque convex polygon in front of them are left out, as they can't be seen
 */
export function orderElements(elements: ReadonlyArray<zOrderElement>): ReadonlyArray<zOrderElement> {
  const items: Array<Item | undefined> = [];
  const swept: Array<number> = [];
  const byDepth: Array<number> = [];
  elements.forEach((e, i) => {
    items.push(e.polygon && createItem(e.polygon, !!e.opaque));
    byDepth.push(i);
    if (e.polygon) {
      swept.push(i);
    }
  });
  swept.sort((a, b) => items[a]!.min.x - items[b]!.min.x);
  byDepth.sort((a, b) => elements[a]!.zOrder - elements[b]!.zOrder);

  // Sweep along x: each item is compared with the active ones whose bounds still overlap it on screen, dropping the others in the same pass
  const behind: Array<Array<number>> = [];
  const hidden = new Uint8Array(elements.length);
  const active: Array<number> = [];
  for (const i of swept) {
    const a = items[i]!;
    active.length = active.reduce((kept, j) => {
      const b = items[j]!;
      if (b.max.x <= a.min.x + eps) {
        return kept;
      }
      active[kept] = j;
      const order = b.min.y < a.max.y - eps && a.min.y < b.max.y - eps ? getOrder(a, b) : 0;
      if (order !== 0) {
        const [back, front] = order < 0 ? [i, j] : [j, i];
        (behind[front] ??= []).push(back);
        hidden[back] ||= covers(items[front]!, items[back]!) ? 1 : 0;
      }
      return kept + 1;
    }, 0);
    active.push(i);
  }

  // Depth first: an element is drawn when it's met on the stack again, after the elements behind it; 1 while it waits, 2 once drawn
  const state = new Uint8Array(elements.length);
  const stack: Array<number> = [];
  const ordered: Array<zOrderElement> = [];
  for (const start of byDepth) {
    stack.push(start);
    while (stack.length > 0) {
      const i = stack.pop()!;
      if (state[i] === 0) {
        state[i] = 1;
        stack.push(i);
        behind[i]?.forEach((j) => state[j] === 0 && stack.push(j));
      } else if (state[i] === 1) {
        state[i] = 2;
        if (!hidden[i]) {
          ordered.push(elements[i]!);
        }
      }
    }
  }
  return ordered;
}

/** Distances below this, in the scene's units, are equal */
const eps = 1e-3;

type Item = {
  readonly points: ReadonlyArray<Vec3>;
  readonly min: Vec3;
  readonly max: Vec3;
  /** The screen's normals of the polygon's edges, which separate it from polygons it doesn't overlap */
  readonly axes: ReadonlyArray<readonly [number, number]>;
  /** Its plane, oriented toward the viewer, unless it's a line or a point, or seen edge on */
  readonly plane?: { readonly normal: Vec3; readonly d: number };
  /** The winding on screen of an opaque convex polygon, 1 or -1, by which it can hide others; 0 for others */
  readonly occluder: number;
};

/** In one pass over the points: their bounds, edge normals on screen, plane by Newell's method, and whether they're a convex polygon */
function createItem(points: ReadonlyArray<Vec3>, opaque: boolean): Item {
  const min = { x: Infinity, y: Infinity, z: Infinity };
  const max = { x: -Infinity, y: -Infinity, z: -Infinity };
  const normal = { x: 0, y: 0, z: 0 };
  // The smallest and largest turn at a corner on screen, the same sign throughout for a convex polygon
  const turns = { min: 0, max: 0 };
  const axes: Array<readonly [number, number]> = [];
  points.forEach((p, i) => {
    Object.assign(min, { x: Math.min(min.x, p.x), y: Math.min(min.y, p.y), z: Math.min(min.z, p.z) });
    Object.assign(max, { x: Math.max(max.x, p.x), y: Math.max(max.y, p.y), z: Math.max(max.z, p.z) });
    const q = points[(i + 1) % points.length]!;
    normal.x += (p.y - q.y) * (p.z + q.z);
    normal.y += (p.z - q.z) * (p.x + q.x);
    normal.z += (p.x - q.x) * (p.y + q.y);
    if (Math.abs(q.x - p.x) + Math.abs(q.y - p.y) > eps) {
      axes.push([q.y - p.y, p.x - q.x]);
    }
    const o = points[(i + points.length - 1) % points.length]!;
    const turn = (p.x - o.x) * (q.y - p.y) - (p.y - o.y) * (q.x - p.x);
    Object.assign(turns, { min: Math.min(turns.min, turn), max: Math.max(turns.max, turn) });
  });
  const convex = points.length >= 3 && (turns.min >= -eps || turns.max <= eps);
  const occluder = opaque && convex ? Math.sign(normal.z) : 0;
  const length = Math.hypot(normal.x, normal.y, normal.z);
  if (points.length < 3 || length < eps || Math.abs(normal.z) < 1e-6 * length) {
    return { points, min, max, axes, occluder: 0 };
  }
  // Toward the viewer, at +z
  const s = Math.sign(normal.z) / length;
  const n = { x: normal.x * s, y: normal.y * s, z: normal.z * s };
  const p0 = points[0]!;
  return { points, min, max, axes, plane: { normal: n, d: n.x * p0.x + n.y * p0.y + n.z * p0.z }, occluder };
}

/** -1 if `a` is drawn before `b`, 1 if after, 0 if they don't overlap or nothing decides */
function getOrder(a: Item, b: Item): number {
  if (a.max.z <= b.min.z + eps) {
    return -1;
  }
  if (b.max.z <= a.min.z + eps) {
    return 1;
  }
  if (!overlap(a, b)) {
    return 0;
  }
  const aToB = b.plane ? getSide(a.points, b.plane) : 0;
  if (aToB !== 0) {
    return aToB;
  }
  return a.plane ? -getSide(b.points, a.plane) : 0;
}

/** -1 if the points are all behind the plane, 1 if all in front of it, 0 if on both sides or in it */
function getSide(points: ReadonlyArray<Vec3>, { normal: n, d }: NonNullable<Item["plane"]>): number {
  const range = { min: Infinity, max: -Infinity };
  points.forEach((p) => {
    const distance = n.x * p.x + n.y * p.y + n.z * p.z - d;
    Object.assign(range, { min: Math.min(range.min, distance), max: Math.max(range.max, distance) });
  });
  return range.max <= eps && range.min < -eps ? -1 : range.min >= -eps && range.max > eps ? 1 : 0;
}

/** Whether the polygons overlap on screen by more than touching: no edge normal of either separates them */
function overlap(a: Item, b: Item): boolean {
  return a.axes.every(([x, y]) => !separates(a, b, x, y)) && b.axes.every(([x, y]) => !separates(a, b, x, y));
}

function separates(a: Item, b: Item, x: number, y: number): boolean {
  const range = { aMin: Infinity, aMax: -Infinity, bMin: Infinity, bMax: -Infinity };
  a.points.forEach((p) => Object.assign(range, { aMin: Math.min(range.aMin, p.x * x + p.y * y), aMax: Math.max(range.aMax, p.x * x + p.y * y) }));
  b.points.forEach((p) => Object.assign(range, { bMin: Math.min(range.bMin, p.x * x + p.y * y), bMax: Math.max(range.bMax, p.x * x + p.y * y) }));
  const tolerance = eps * Math.hypot(x, y);
  return range.aMax <= range.bMin + tolerance || range.bMax <= range.aMin + tolerance;
}

/** Whether the front's opaque convex polygon contains all of the back's points on screen, so the back can't be seen; not for a single point, e.g. text */
function covers(front: Item, back: Item): boolean {
  const { points, occluder } = front;
  return (
    occluder !== 0 &&
    back.points.length >= 2 &&
    points.every((p, i) => {
      const q = points[(i + 1) % points.length]!;
      return back.points.every((r) => occluder * ((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)) >= -eps * Math.hypot(q.x - p.x, q.y - p.y));
    })
  );
}
