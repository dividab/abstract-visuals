import type { Vec2, Vec3 } from "../../abstract-3d.js";
import { vec3Zero } from "../../abstract-3d.js";
import { svgEdges, svgPolygon } from "./svg-encoding.js";
import type { zOrderElement } from "./svg-geometries/shared.js";
import { isOpaque } from "./svg-geometries/shared.js";

/**
 * Elements in drawing order, back to front, by a BSP tree of their planes: of each node, what's behind its plane is drawn first, then what's in it,
 * then what's in front of it. An element on both sides of a plane is split by it when it's a plain polygon, its pieces stroked only along its own
 * edges, else put on the side of its center, and drawn whole again where nothing drawn between its pieces overlaps it on screen. Elements without
 * points are drawn last, by mean depth. Elements entirely inside an opaque convex polygon drawn after them are left out, as they can't be seen
 */
export function orderElements(elements: ReadonlyArray<zOrderElement>, point: (x: number, y: number) => Vec2): ReadonlyArray<zOrderElement> {
  const pieces: Array<Piece> = [];
  const pointless: Array<zOrderElement> = [];
  for (const element of elements) {
    if (element.polygon?.length) {
      pieces.push({ element, points: element.polygon, plane: getPlane(element.polygon) });
    } else {
      pointless.push(element);
    }
  }
  const drawn: Drawn = { pieces: [], items: [], spans: new Map() };
  draw(pieces, drawn);
  const state = getHidden(drawn.items);
  mergeSplit(drawn, state);
  const ordered: Array<zOrderElement> = [];
  for (let i = 0; i < drawn.pieces.length; i++) {
    const p = drawn.pieces[i]!;
    if (state[i] !== skip) {
      ordered.push(state[i] === whole || !p.edges ? p.element : createPieceElement(p, point));
    }
  }
  return [...ordered, ...pointless.sort((a, b) => a.zOrder - b.zOrder)];
}

/** Distances below this, in the scene's units, are equal */
const eps = 1e-3;
/** The planes tried at a node, spread over its pieces, of which the one splitting the fewest is taken */
const candidates = 8;
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
/** Pieces in drawing order, their items, and of each split element the first and last of its pieces */
type Drawn = {
  readonly pieces: Array<Piece>;
  readonly items: Array<Item>;
  readonly spans: Map<zOrderElement, { readonly first: number; readonly last: number }>;
};

/** The tree walked as it's built, with a stack instead of recursion, as it's as deep as a scene's planes can be many: back, then in, then front */
function draw(pieces: ReadonlyArray<Piece>, drawn: Drawn): void {
  const stack: Array<{ readonly pieces: ReadonlyArray<Piece>; readonly inPlane?: boolean }> = [{ pieces }];
  while (stack.length > 0) {
    const task = stack.pop()!;
    const plane = task.inPlane ? undefined : getSplitter(task.pieces);
    if (plane) {
      const [back, inPlane, front]: [Array<Piece>, Array<Piece>, Array<Piece>] = [[], [], []];
      for (const p of task.pieces) {
        partition(p, plane, back, inPlane, front);
      }
      stack.push({ pieces: front }, { pieces: inPlane, inPlane: true }, { pieces: back });
      continue;
    }
    // In a plane, as given; else a leaf, whose pieces have no plane, by mean depth
    for (const p of task.inPlane ? task.pieces : [...task.pieces].sort((a, b) => a.element.zOrder - b.element.zOrder)) {
      if (p.edges) {
        drawn.spans.set(p.element, { first: drawn.spans.get(p.element)?.first ?? drawn.pieces.length, last: drawn.pieces.length });
      }
      drawn.pieces.push(p);
      drawn.items.push(createItem(p.points, !!p.element.opaque));
    }
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

/** Behind, in or in front of the plane; split by it if on both sides and a plain polygon, else on the side of its center */
function partition(piece: Piece, plane: Plane, back: Array<Piece>, inPlane: Array<Piece>, front: Array<Piece>): void {
  // An element's pieces share its plane, which they're in, though its points may be off it by more than eps
  const side = piece.plane === plane ? 0 : getSide(piece.points, plane);
  if (side === 2 && piece.element.style && piece.points.length >= 3) {
    split(piece, plane, back, front);
  } else if (side === 2) {
    let sum = 0;
    for (const p of piece.points) {
      sum += getDistance(p, plane);
    }
    (sum < 0 ? back : front).push(piece);
  } else {
    (side === 0 ? inPlane : side < 0 ? back : front).push(piece);
  }
}

/** Sutherland–Hodgman against the plane, both ways; an edge of a piece along the cut isn't the element's own */
function split(piece: Piece, plane: Plane, back: Array<Piece>, front: Array<Piece>): void {
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
  if (b.points.length >= 3) {
    back.push({ ...piece, ...b });
  }
  if (f.points.length >= 3) {
    front.push({ ...piece, ...f });
  }
}

function createPieceElement({ element, points, edges = [] }: Piece, point: (x: number, y: number) => Vec2): zOrderElement {
  const { fill, opacity, stroke, strokeWidth } = element.style!;
  const screen = points.map((p) => point(p.x, p.y));
  const outline = strokeWidth > 0 && isOpaque(stroke, 1) && edges.includes(true) ? svgEdges(screen, edges, stroke, strokeWidth) : "";
  return { ...element, element: svgPolygon(vec3Zero, screen, fill, opacity, stroke, 0) + outline, polygon: points };
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

/** Of items drawn back to front, `skip` for those inside an opaque convex polygon drawn after them; a sweep along x over their bounds on screen */
function getHidden(items: ReadonlyArray<Item>): Uint8Array {
  const state = new Uint8Array(items.length);
  const active: Array<number> = [];
  for (const i of [...items.keys()].sort((a, b) => items[a]!.min.x - items[b]!.min.x)) {
    const a = items[i]!;
    // Those whose bounds end before this one's start are dropped in place
    let kept = 0;
    for (const j of active) {
      const b = items[j]!;
      if (b.max.x > a.min.x + eps) {
        active[kept++] = j;
        // Along x they overlap, by the sweep, which a vertical line's zero width wouldn't by bounds
        const [back, front] = [Math.min(i, j), Math.max(i, j)];
        state[back] ||= a.min.y < b.max.y - eps && b.min.y < a.max.y - eps && covers(items[front]!, items[back]!) ? skip : 0;
      }
    }
    active.length = kept;
    active.push(i);
  }
  return state;
}

/**
 * A split element whose pieces have nothing else drawn between them that overlaps it on screen is drawn whole where its last piece is, its other
 * pieces skipped, unless they're all hidden
 */
function mergeSplit({ pieces, items, spans }: Drawn, state: Uint8Array): void {
  for (const [element, { first, last }] of spans) {
    const bounds = createItem(element.polygon!, false);
    let [blocked, visible] = [false, false];
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

/** Whether the front's opaque convex polygon contains all of the back's points on screen, so the back can't be seen; not for a single point, e.g. text */
function covers({ points, occluder }: Item, back: Item): boolean {
  if (occluder === 0 || back.points.length < 2) {
    return false;
  }
  for (let i = 0; i < points.length; i++) {
    const [p, q] = [points[i]!, points[(i + 1) % points.length]!];
    const tolerance = -eps * Math.hypot(q.x - p.x, q.y - p.y);
    for (const r of back.points) {
      if (occluder * ((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)) < tolerance) {
        return false;
      }
    }
  }
  return true;
}
