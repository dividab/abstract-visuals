import { describe, expect, it } from "vitest";
import type { Vec3 } from "../../abstract-3d.js";
import { vec3 } from "../../abstract-3d.js";
import type { PolygonStyle, zOrderElement } from "./svg-geometries/shared.js";
import { zElem } from "./svg-geometries/shared.js";
import { orderElements } from "./svg-order.js";

const face = (element: string, points: ReadonlyArray<Vec3>, opaque?: boolean, style?: PolygonStyle): zOrderElement =>
  zElem(element, points.reduce((sum, p) => sum + p.z, 0) / points.length, points, opaque, style);
const quad = (element: string, x0: number, x1: number, z: (x: number) => number, opaque?: boolean, style?: PolygonStyle): zOrderElement =>
  face(element, [vec3(x0, -1, z(x0)), vec3(x1, -1, z(x1)), vec3(x1, 1, z(x1)), vec3(x0, 1, z(x0))], opaque, style);
const style = (fill: string, strokeWidth = 0): PolygonStyle => ({ fill, opacity: 1, stroke: "rgb(0,0,0)", strokeWidth });
const order = (...elements: ReadonlyArray<zOrderElement>): ReadonlyArray<string> => orderElements(elements).map((e) => e.element);
/** The fill of the last drawn element whose polygon's bounds contain the point on screen */
const topAt = (ordered: ReadonlyArray<zOrderElement>, x: number, y: number): string | undefined =>
  ordered
    .filter(({ polygon = [] }) => {
      const xs = polygon.map((p) => p.x);
      const ys = polygon.map((p) => p.y);
      return Math.min(...xs) < x && x < Math.max(...xs) && Math.min(...ys) < y && y < Math.max(...ys);
    })
    .at(-1)?.style?.fill;

/** A fin facing the viewer at depth -k, each a step to the right of the one in front of it, so a strip of it shows */
const fin = (k: number): zOrderElement =>
  face(`fin${k}`, [vec3(k, 0, -k), vec3(k + 10, 0, -k), vec3(k + 10, 10, -k), vec3(k, 10, -k)], true, style("fin"));
/** A tube's face from in front of the first fin through the middle of all `fins`, to behind the last */
const tube = (t: number, fins: number): zOrderElement =>
  face(
    `tube${t}`,
    [vec3(3, t + 1, 2), vec3(4, t + 1.5, 2), vec3(4 + fins + 2, t + 1.5, -fins), vec3(3 + fins + 2, t + 1, -fins)],
    true,
    style("tube")
  );
/** A slat along x and one along y, each tilted across its width, so every slat along x cuts through every slat along y */
const slats = (i: number, count: number): ReadonlyArray<zOrderElement> => [
  face(`x${i}`, [vec3(0, 2 * i, -1), vec3(2 * count, 2 * i, -1), vec3(2 * count, 2 * i + 1, 1), vec3(0, 2 * i + 1, 1)], true, style("x")),
  face(`y${i}`, [vec3(2 * i, 0, -1), vec3(2 * i + 1, 0, 1), vec3(2 * i + 1, 2 * count, 1), vec3(2 * i, 2 * count, -1)], true, style("y")),
];

describe("orderElements", () => {
  it("draws a part in front of a long tilted face after it, though the face's mean depth is nearer", () => {
    // The face runs from z -10 at x -10 to z 10 at x 10, mean 0; the part at z -5 is in front of it where they overlap, at x -9 to -8
    const tilted = quad("face", -10, 10, (x) => x);
    const part = quad("part", -9, -8, () => -5);
    expect(order(part, tilted)).toEqual(["face", "part"]);
  });

  it("doesn't cut a symbol, which can't be split, by a plane when another will do, so it isn't drawn behind a face it's in front of", () => {
    // The tilted face's plane cuts the symbol at x 3.25, its center behind it; the face behind the symbol is in front of the plane
    const tilted = face("tilted", [vec3(2, 20, -20), vec3(4, 20, 20), vec3(4, 30, 20), vec3(2, 30, -20)], true, style("tilted"));
    const symbol = zElem("symbol", 5, [vec3(0, 0, 5), vec3(10, 0, 5), vec3(10, 10, 5), vec3(0, 10, 5)]);
    const behind = face("behind", [vec3(0, 0, 0), vec3(2, 0, 0), vec3(2, 10, 0), vec3(0, 10, 0)], true, style("behind"));
    const ordered = order(tilted, symbol, behind);
    expect(ordered.indexOf("behind")).toBeLessThan(ordered.indexOf("symbol"));
  });

  it("keeps the mean depth order of elements that don't overlap on screen, or have no points", () => {
    expect(
      order(
        quad("near", 0, 1, () => 1),
        quad("far", 5, 6, () => -1)
      )
    ).toEqual(["far", "near"]);
    expect(order(zElem("text", 2), zElem("line", -2))).toEqual(["line", "text"]);
  });

  it("draws every element once when it can't be split, also when they overlap in a cycle", () => {
    const elements = [quad("a", 0, 2, (x) => x), quad("b", 1, 3, (x) => 2 - x), quad("c", -1, 4, () => 1), zElem("text", 0)];
    expect([...order(...elements)].sort()).toEqual(["a", "b", "c", "text"]);
  });

  it("splits faces that cut through each other, each drawn in front where it's nearer", () => {
    // Crossing at x 0: a is nearer at x > 0, b at x < 0
    const ordered = orderElements([quad("a", -1, 1, (x) => x, true, style("a")), quad("b", -1, 1, (x) => -x, true, style("b"))]);
    expect([topAt(ordered, 0.5, 0), topAt(ordered, -0.5, 0)]).toEqual(["a", "b"]);
  });

  it("gives a split face's pieces with which of their edges are its own, not the cut", () => {
    const ordered = orderElements([quad("a", -1, 1, (x) => x, true, style("a", 2)), quad("b", -1, 1, (x) => -x, true, style("b", 2))]);
    const pieces = ordered.filter((e) => e.edges);
    expect(pieces.length).toBeGreaterThan(0);
    // A piece of a quad cut at x 0: three of its four edges are its own, the other one runs along x 0
    for (const { polygon = [], edges = [] } of pieces) {
      expect(edges.filter(Boolean).length).toBe(3);
      const cut = edges.indexOf(false);
      expect(polygon.at(cut)?.x).toBeCloseTo(0);
      expect(polygon.at((cut + 1) % polygon.length)?.x).toBeCloseTo(0);
    }
  });

  it("draws a face split by a plane whole, when nothing drawn between its pieces overlaps it", () => {
    // Each is on both sides of the other's plane, so one is split, but b is above a on screen
    const b = zElem("b", 0, [vec3(-1, 5, 1), vec3(1, 5, -1), vec3(1, 6, -1), vec3(-1, 6, 1)], true, style("b"));
    const ordered = orderElements([quad("a", -1, 1, (x) => x, true, style("a")), b]);
    expect(ordered.map((e) => e.element).sort()).toEqual(["a", "b"]);
    expect(ordered.some((e) => e.edges)).toBe(false);
  });

  it("leaves out what an opaque face in front covers", () => {
    expect(
      order(
        quad("small", -1, 1, () => 0),
        quad("big", -2, 2, () => 1, true)
      )
    ).toEqual(["big"]);
    expect(
      order(
        quad("small", -1, 1, () => 0),
        quad("glass", -2, 2, () => 1)
      )
    ).toEqual(["small", "glass"]);
  });

  it("leaves out the pieces of faces through many others that are hidden between them, so they don't grow with the faces they're through", () => {
    // Each tube is through every fin; between two fins it's behind the nearer one, and inside it on screen
    const [fins, tubes] = [400, 8];
    const elements = [...Array.from({ length: fins }, (_, k) => fin(k)), ...Array.from({ length: tubes }, (_, t) => tube(t, fins))];
    const ordered = orderElements(elements);
    // Of each tube, what's in front of the first fin, and at most a piece in its own plane, not one between each two fins
    expect(ordered.filter((e) => e.style?.fill === "tube").length).toBeLessThanOrEqual(2 * tubes);
    expect(ordered.length).toBeLessThan(2 * elements.length);
    // The tube in front of the first fin, the first fin past it, and the last fins in front of the tube through them
    expect([topAt(ordered, 3.5, 1.2), topAt(ordered, 8, 1.2), topAt(ordered, 403, 1.3)]).toEqual(["tube", "fin", "fin"]);
  });

  it("stops splitting faces that cut through each other all over, so a scene of them is ordered in time", () => {
    // Every slat along x is cut by every slat along y, and the other way around, into `count` pieces each: more work than a scene's tree gets
    const count = 400;
    const elements = Array.from({ length: count }, (_, i) => slats(i, count)).flat();
    const ordered = orderElements(elements);
    expect(new Set(ordered.map((e) => e.element)).size).toBe(elements.length);
    expect(ordered.length).toBeLessThan((count * count) / 2);
  });
});
