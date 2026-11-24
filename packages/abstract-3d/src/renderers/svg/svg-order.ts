import type { Vec2, Vec3 } from "../../abstract-3d.js";
import type { zOrderElement } from "./svg-geometries/shared.js";

/**
 * Elements in drawing order, back to front, by a BSP tree of their planes: of each node, what's behind its plane is drawn first, then what's in it,
 * then what's in front of it. An element on both sides of a plane is split by it when it's a plain polygon, its pieces given with which of their
 * edges are its own, else put on the side of its center, and drawn whole again where nothing drawn between its pieces overlaps it on screen. Elements
 * without points are drawn last, by mean depth. Elements entirely inside an opaque convex polygon drawn after them are left out, as they can't be
 * seen, pieces as soon as they're behind one, so what's hidden isn't split further. The tree's work is limited by the number of elements, past which
 * what's left, the farthest, is drawn by mean depth, so a scene whose faces cut through each other all over is ordered roughly, not slowly
 */
export function orderElements(elements: ReadonlyArray<zOrderElement>): ReadonlyArray<zOrderElement> {
  const pieces: Array<Piece> = [];
  const pointless: Array<zOrderElement> = [];
  for (const element of elements) {
    if (element.polygon?.length) {
      pieces.push({ element, points: element.polygon, plane: getPlane(element.polygon) });
    } else {
      pointless.push(element);
    }
  }
  const drawn: Drawn = { pieces: [], items: [], spans: new Map(), culled: new Set() };
  draw(pieces, drawn);
  const state = getHidden(drawn.items);
  mergeSplit(drawn, state);
  const ordered: Array<zOrderElement> = [];
  for (let i = 0; i < drawn.pieces.length; i++) {
    const p = drawn.pieces[i]!;
    if (state[i] !== skip) {
      ordered.push(state[i] === whole || !p.edges ? p.element : { ...p.element, polygon: p.points, edges: p.edges });
    }
  }
  return [...ordered, ...pointless.sort((a, b) => a.zOrder - b.zOrder)];
}

/** Distances below this, in the scene's units, are equal */
const eps = 1e-3;
/** The planes tried at a node, spread over its pieces, of which the one splitting the fewest is taken */
const candidates = 8;
/**
 * The work a scene's tree gets, which takes up to a second: a piece sorted at a node is 1 and a split 16, this many per element, and as many more as
 * a small scene with faces through each other needs
 */
const [workPerElement, workAtLeast, workPerSplit] = [256, 2 ** 20, 16];
/** The opaque faces of a plane that what's behind it is tested against, its largest */
const maxOccluders = 8;
/** The cells along the screen of the finest grid of occluders, a level up halving them; 2 to the power of its levels */
const [gridCells, gridLevels] = [256, 8];
const noCell: ReadonlyArray<number> = [];
/** A drawn piece's state: drawn as it is, left out, or drawn as its whole element */
const [skip, whole] = [1, 2];

/** A plane oriented toward the viewer, at +z */
type Plane = { readonly normal: Vec3; readonly d: number };
/** An element, or a piece of it with whether the edge from each point to the next is the element's own, not a cut */
type Piece = {
  readonly element: zOrderElement;
  readonly points: ReadonlyArray<Vec3>;
  readonly plane?: Plane;
  readonly edges?: ReadonlyArray<boolean>;
};
type Item = {
  readonly points: ReadonlyArray<Vec3>;
  readonly min: Vec2;
  readonly max: Vec2;
  /** The winding on screen of an opaque convex polygon, 1 or -1, by which it can hide others; 0 for others */
  readonly occluder: number;
};
/** A node's pieces, and the opaque faces of the nearest plane they're all behind, which hide the pieces inside them on screen */
type Task = { readonly pieces: ReadonlyArray<Piece>; readonly occluders: ReadonlyArray<Item>; readonly inPlane?: boolean };
/** Pieces in drawing order, their items, of each split element the first and last of its pieces, and the elements with a piece left out as hidden */
type Drawn = {
  readonly pieces: Array<Piece>;
  readonly items: Array<Item>;
  readonly spans: Map<zOrderElement, { readonly first: number; readonly last: number }>;
  readonly culled: Set<zOrderElement>;
};

/**
 * The tree walked as it's built, with a stack instead of recursion, as it's as deep as a scene's planes can be many: front, then in, then back, so
 * the work goes to what's nearest when it runs out; drawn the other way
 */
function draw(pieces: ReadonlyArray<Piece>, drawn: Drawn): void {
  const stack: Array<Task> = [{ pieces, occluders: [] }];
  const nearest: Array<Piece> = [];
  let work = workPerElement * pieces.length + workAtLeast;
  while (stack.length > 0) {
    const task = stack.pop()!;
    work -= task.pieces.length;
    const plane = task.inPlane || work <= 0 ? undefined : getSplitter(task.pieces);
    if (plane) {
      const [back, inPlane, front, across]: [Array<Piece>, Array<Piece>, Array<Piece>, Array<Piece>] = [[], [], [], []];
      const occluders: Array<Item> = [];
      for (const p of task.pieces) {
        // An element's pieces share its plane, which they're in, though its points may be off it by more than eps
        const side = p.plane === plane ? 0 : getSide(p.points, plane);
        if (side === 2 && p.element.style && p.points.length >= 3 && work > 0) {
          work -= workPerSplit;
          split(p, plane, back, front, task.occluders, drawn.culled);
        } else {
          (side === 0 ? inPlane : side < 0 ? back : side === 1 ? front : across).push(p);
        }
        const occluder = side === 0 && p.element.opaque ? createItem(p.points, true) : undefined;
        if (occluder && occluder.occluder !== 0) {
          occluders.push(occluder);
        }
      }
      occluders.sort((a, b) => (b.max.x - b.min.x) * (b.max.y - b.min.y) - (a.max.x - a.min.x) * (a.max.y - a.min.y));
      occluders.length = Math.min(occluders.length, maxOccluders);
      // What's behind the plane and inside one of its opaque faces can't be seen
      let kept = 0;
      for (const p of back) {
        if (isCovered(p.points, occluders)) {
          drawn.culled.add(p.element);
        } else {
          back[kept++] = p;
        }
      }
      back.length = kept;
      // On both sides, unsplit: on the side of its center, where it's not all behind the plane
      for (const p of across) {
        let sum = 0;
        for (const point of p.points) {
          sum += getDistance(point, plane);
        }
        (sum < 0 ? back : front).push(p);
      }
      stack.push(
        { pieces: back, occluders: occluders.length > 0 ? occluders : task.occluders },
        { pieces: inPlane, occluders: task.occluders, inPlane: true },
        { pieces: front, occluders: task.occluders }
      );
      continue;
    }
    // In a plane, as given; else a leaf, whose pieces have no plane, or what's left when the work has run out, by mean depth
    const list = task.inPlane ? task.pieces : [...task.pieces].sort((a, b) => a.element.zOrder - b.element.zOrder);
    for (let i = list.length - 1; i >= 0; i--) {
      nearest.push(list[i]!);
    }
  }
  for (let i = nearest.length - 1; i >= 0; i--) {
    const p = nearest[i]!;
    if (p.edges) {
      drawn.spans.set(p.element, { first: drawn.spans.get(p.element)?.first ?? drawn.pieces.length, last: drawn.pieces.length });
    }
    drawn.pieces.push(p);
    drawn.items.push(createItem(p.points, !!p.element.opaque));
  }
}

/** Of the candidates' planes, the one that the fewest pieces are on both sides of */
function getSplitter(pieces: ReadonlyArray<Piece>): Plane | undefined {
  const step = Math.max(1, Math.floor(pieces.length / candidates));
  let best: Plane | undefined = undefined;
  let fewest = Infinity;
  for (let i = 0; i < pieces.length && fewest > 0;) {
    const plane = pieces[i]!.plane;
    if (plane) {
      let splits = 0;
      for (const p of pieces) {
        if (p.plane !== plane && getSide(p.points, plane) === 2 && ++splits >= fewest) {
          break;
        }
      }
      [best, fewest] = splits < fewest ? [plane, splits] : [best, fewest];
    }
    i += plane ? step : 1;
  }
  return best;
}

/**
 * Sutherland–Hodgman against the plane, both ways; an edge of a piece along the cut isn't the element's own. A piece inside one of the occluders,
 * which it's behind, is left out
 */
function split(
  piece: Piece,
  plane: Plane,
  back: Array<Piece>,
  front: Array<Piece>,
  occluders: ReadonlyArray<Item>,
  culled: Set<zOrderElement>
): void {
  const { points, edges } = piece;
  const [b, f] = [
    { points: Array<Vec3>(), edges: Array<boolean>() },
    { points: Array<Vec3>(), edges: Array<boolean>() },
  ];
  const first = getDistance(points[0]!, plane);
  let dp = first;
  for (let i = 0; i < points.length; i++) {
    const [p, q] = [points[i]!, points[(i + 1) % points.length]!];
    const dq = i + 1 < points.length ? getDistance(q, plane) : first;
    const own = edges?.[i] ?? true;
    const crosses = (dp < -eps && dq > eps) || (dp > eps && dq < -eps);
    if (dp <= eps) {
      b.points.push(p);
      b.edges.push(own && (crosses || dq <= eps));
    }
    if (dp >= -eps) {
      f.points.push(p);
      f.edges.push(own && (crosses || dq >= -eps));
    }
    if (crosses) {
      const t = dp / (dp - dq);
      const r = { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t, z: p.z + (q.z - p.z) * t };
      b.points.push(r);
      b.edges.push(own && dq < 0);
      f.points.push(r);
      f.edges.push(own && dq > 0);
    }
    dp = dq;
  }
  for (const [half, side] of [
    [b, back],
    [f, front],
  ] as const) {
    if (half.points.length >= 3 && isCovered(half.points, occluders)) {
      culled.add(piece.element);
    } else if (half.points.length >= 3) {
      side.push({ ...piece, ...half });
    }
  }
}

/** By Newell's method, unless they're a line or a point, or seen edge on */
function getPlane(points: ReadonlyArray<Vec3>): Plane | undefined {
  let [x, y, z] = [0, 0, 0];
  for (let i = 0; i < points.length; i++) {
    const [p, q] = [points[i]!, points[(i + 1) % points.length]!];
    [x, y, z] = [x + (p.y - q.y) * (p.z + q.z), y + (p.z - q.z) * (p.x + q.x), z + (p.x - q.x) * (p.y + q.y)];
  }
  const length = Math.hypot(x, y, z);
  if (points.length < 3 || length < eps || Math.abs(z) < 1e-6 * length) {
    return undefined;
  }
  const s = Math.sign(z) / length;
  const n = { x: x * s, y: y * s, z: z * s };
  return { normal: n, d: n.x * points[0]!.x + n.y * points[0]!.y + n.z * points[0]!.z };
}

const getDistance = (p: Vec3, { normal: n, d }: Plane): number => n.x * p.x + n.y * p.y + n.z * p.z - d;

/** -1 if the points are all behind the plane, 1 if all in front of it, 0 if all in it, 2 if on both sides */
function getSide(points: ReadonlyArray<Vec3>, plane: Plane): number {
  let [min, max] = [Infinity, -Infinity];
  for (const p of points) {
    const distance = getDistance(p, plane);
    min = Math.min(min, distance);
    max = Math.max(max, distance);
  }
  return min >= -eps ? (max > eps ? 1 : 0) : max <= eps ? -1 : 2;
}

/**
 * Of items drawn back to front, `skip` for those inside an opaque convex polygon drawn after them. From the last drawn, each is tested against the
 * occluders so far, kept by the cells they overlap of the grid level whose cells their shorter side fits in: one that contains an item is in the cell
 * of the item's corner, at one of the levels
 */
function getHidden(items: ReadonlyArray<Item>): Uint8Array {
  const state = new Uint8Array(items.length);
  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const { min, max } of items) {
    [minX, minY, maxX, maxY] = [Math.min(minX, min.x), Math.min(minY, min.y), Math.max(maxX, max.x), Math.max(maxY, max.y)];
  }
  const finest = Math.max(maxX - minX, maxY - minY, eps) / gridCells;
  const cells = new Map<number, Array<number>>();
  for (let i = items.length - 1; i >= 0; i--) {
    const a = items[i]!;
    for (let level = 0; cells.size > 0 && level <= gridLevels && state[i] === 0; level++) {
      const size = finest * 2 ** level;
      const cell = cells.get((level * 512 + Math.floor((a.min.x - minX) / size)) * 512 + Math.floor((a.min.y - minY) / size)) ?? noCell;
      for (let k = 0; k < cell.length && state[i] === 0; k++) {
        const b = items[cell[k]!]!;
        const inside = b.min.x <= a.min.x + eps && b.min.y <= a.min.y + eps && b.max.x >= a.max.x - eps && b.max.y >= a.max.y - eps;
        state[i] = inside && covers(b, a.points) ? skip : 0;
      }
    }
    // What a hidden occluder hides is hidden by what hides it
    if (a.occluder !== 0 && state[i] === 0) {
      const level = Math.max(0, Math.ceil(Math.log2(Math.min(a.max.x - a.min.x, a.max.y - a.min.y) / finest)));
      const size = finest * 2 ** level;
      for (let x = Math.floor((a.min.x - minX) / size); x <= Math.floor((a.max.x - minX) / size); x++) {
        for (let y = Math.floor((a.min.y - minY) / size); y <= Math.floor((a.max.y - minY) / size); y++) {
          const key = (level * 512 + x) * 512 + y;
          const cell = cells.get(key);
          if (cell) {
            cell.push(i);
          } else {
            cells.set(key, [i]);
          }
        }
      }
    }
  }
  return state;
}

/**
 * A split element whose pieces have nothing else drawn between them that overlaps it on screen is drawn whole where its last piece is, its other
 * pieces skipped, unless they're all hidden, or one was left out as hidden, behind what the whole would be drawn over
 */
function mergeSplit({ pieces, items, spans, culled }: Drawn, state: Uint8Array): void {
  for (const [element, { first, last }] of spans) {
    const bounds = createItem(element.polygon!, false);
    let [blocked, visible] = [culled.has(element), false];
    for (let k = first; k <= last && !blocked; k++) {
      const own = pieces[k]!.element === element;
      visible ||= own && state[k] !== skip;
      blocked = !own && overlaps(items[k]!, bounds);
    }
    if (!blocked) {
      for (let k = first; k <= last; k++) {
        state[k] = pieces[k]!.element === element ? skip : state[k]!;
      }
      state[last] = visible ? whole : skip;
    }
  }
}

/** In one pass over the points: their bounds on screen, and whether they're a convex polygon */
function createItem(points: ReadonlyArray<Vec3>, opaque: boolean): Item {
  const [min, max] = [
    { x: Infinity, y: Infinity },
    { x: -Infinity, y: -Infinity },
  ];
  // Twice the signed area, and the smallest and largest turn at a corner on screen, the same sign throughout for a convex polygon
  let [area, minTurn, maxTurn] = [0, 0, 0];
  for (let i = 0; i < points.length; i++) {
    const o = points[(i + points.length - 1) % points.length]!;
    const p = points[i]!;
    const q = points[(i + 1) % points.length]!;
    min.x = Math.min(min.x, p.x);
    min.y = Math.min(min.y, p.y);
    max.x = Math.max(max.x, p.x);
    max.y = Math.max(max.y, p.y);
    const turn = (p.x - o.x) * (q.y - p.y) - (p.y - o.y) * (q.x - p.x);
    area += p.x * q.y - q.x * p.y;
    minTurn = Math.min(minTurn, turn);
    maxTurn = Math.max(maxTurn, turn);
  }
  const convex = points.length >= 3 && (minTurn >= -eps || maxTurn <= eps) && Math.abs(area) > eps;
  return { points, min, max, occluder: opaque && convex ? Math.sign(area) : 0 };
}

const overlaps = (a: Pick<Item, "min" | "max">, b: Pick<Item, "min" | "max">): boolean =>
  a.min.x < b.max.x - eps && b.min.x < a.max.x - eps && a.min.y < b.max.y - eps && b.min.y < a.max.y - eps;

/** Whether one of the occluders, which the points are behind, contains them all on screen */
function isCovered(points: ReadonlyArray<Vec3>, occluders: ReadonlyArray<Item>): boolean {
  for (const occluder of occluders) {
    if (covers(occluder, points)) {
      return true;
    }
  }
  return false;
}

/** Whether the front's opaque convex polygon contains all of the points on screen, so they can't be seen; not for a single point, e.g. text */
function covers({ points, occluder }: Item, back: ReadonlyArray<Vec3>): boolean {
  if (occluder === 0 || back.length < 2) {
    return false;
  }
  for (let i = 0; i < points.length; i++) {
    const [p, q] = [points[i]!, points[(i + 1) % points.length]!];
    const tolerance = -eps * Math.hypot(q.x - p.x, q.y - p.y);
    for (const r of back) {
      if (occluder * ((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)) < tolerance) {
        return false;
      }
    }
  }
  return true;
}
