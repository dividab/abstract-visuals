import { describe, expect, it } from "vitest";
import type { Vec2, Vec3 } from "../../abstract-3d.js";
import { vec2, vec3 } from "../../abstract-3d.js";
import type { PolygonStyle, zOrderElement } from "./svg-geometries/shared.js";
import { zElem } from "./svg-geometries/shared.js";
import { orderElements } from "./svg-order.js";

const point = (x: number, y: number): Vec2 => vec2(x, -y);
const quad = (element: string, x0: number, x1: number, z: (x: number) => number, opaque?: boolean, style?: PolygonStyle): zOrderElement => {
  const points: ReadonlyArray<Vec3> = [vec3(x0, -1, z(x0)), vec3(x1, -1, z(x1)), vec3(x1, 1, z(x1)), vec3(x0, 1, z(x0))];
  return zElem(element, points.reduce((sum, p) => sum + p.z, 0) / points.length, points, opaque, style);
};
const style = (fill: string, strokeWidth = 0): PolygonStyle => ({ fill, opacity: 1, stroke: "rgb(0,0,0)", strokeWidth });
const order = (...elements: ReadonlyArray<zOrderElement>): ReadonlyArray<string> => orderElements(elements, point).map((e) => e.element);
/** The fill of the last drawn element whose polygon contains the point on screen */
const topAt = (ordered: ReadonlyArray<zOrderElement>, x: number, y: number): string | undefined =>
  ordered
    .filter(({ polygon = [] }) => {
      const xs = polygon.map((p) => p.x);
      const ys = polygon.map((p) => p.y);
      return Math.min(...xs) < x && x < Math.max(...xs) && Math.min(...ys) < y && y < Math.max(...ys);
    })
    .at(-1)?.style?.fill;

describe("orderElements", () => {
  it("draws a part in front of a long tilted face after it, though the face's mean depth is nearer", () => {
    // The face runs from z -10 at x -10 to z 10 at x 10, mean 0; the part at z -5 is in front of it where they overlap, at x -9 to -8
    const face = quad("face", -10, 10, (x) => x);
    const part = quad("part", -9, -8, () => -5);
    expect(order(part, face)).toEqual(["face", "part"]);
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
    const ordered = orderElements([quad("a", -1, 1, (x) => x, true, style("a")), quad("b", -1, 1, (x) => -x, true, style("b"))], point);
    expect([topAt(ordered, 0.5, 0), topAt(ordered, -0.5, 0)]).toEqual(["a", "b"]);
  });

  it("strokes a split face's pieces along its own edges, not the cut", () => {
    const ordered = orderElements([quad("a", -1, 1, (x) => x, true, style("a", 2)), quad("b", -1, 1, (x) => -x, true, style("b", 2))], point);
    const pieces = ordered.filter((e) => e.element.includes("<path"));
    expect(pieces.length).toBeGreaterThan(0);
    // A piece of a: its polygon unstroked, its outline three of its four edges, without the cut at x 0 from y -1 to 1
    pieces.forEach((e) => expect(e.element).toMatch(/^<polygon[^>]*stroke-width="0"[^>]*\/><path[^>]* d="M[^"]*L[^"]*L[^"]*L[^"]*"/));
    pieces.forEach((e) => expect(e.element).not.toMatch(/0,-1L0,1|0,1L0,-1/));
  });

  it("draws a face split by a plane whole, when nothing drawn between its pieces overlaps it", () => {
    // Each is on both sides of the other's plane, so one is split, but b is above a on screen
    const b = zElem("b", 0, [vec3(-1, 5, 1), vec3(1, 5, -1), vec3(1, 6, -1), vec3(-1, 6, 1)], true, style("b"));
    expect(
      [
        ...order(
          quad("a", -1, 1, (x) => x, true, style("a")),
          b
        ),
      ].sort()
    ).toEqual(["a", "b"]);
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
});
