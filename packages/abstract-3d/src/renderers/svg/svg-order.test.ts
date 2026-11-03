import { describe, expect, it } from "vitest";
import type { Vec3 } from "../../abstract-3d.js";
import { vec3 } from "../../abstract-3d.js";
import { zElem } from "./svg-geometries/shared.js";
import { orderElements } from "./svg-order.js";

const quad = (element: string, x0: number, x1: number, z: (x: number) => number): ReturnType<typeof zElem> => {
  const points: ReadonlyArray<Vec3> = [vec3(x0, -1, z(x0)), vec3(x1, -1, z(x1)), vec3(x1, 1, z(x1)), vec3(x0, 1, z(x0))];
  return zElem(element, points.reduce((sum, p) => sum + p.z, 0) / points.length, points);
};
const order = (...elements: ReadonlyArray<ReturnType<typeof zElem>>): ReadonlyArray<string> => orderElements(elements).map((e) => e.element);

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

  it("draws every element once, also when they overlap in a cycle", () => {
    const elements = [quad("a", 0, 2, (x) => x), quad("b", 1, 3, (x) => 2 - x), quad("c", -1, 4, () => 1), zElem("text", 0)];
    expect([...order(...elements)].sort()).toEqual(["a", "b", "c", "text"]);
  });
});
