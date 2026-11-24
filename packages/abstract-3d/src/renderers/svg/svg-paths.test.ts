import { describe, expect, it } from "vitest";
import type { Vec2, Vec3 } from "../../abstract-3d.js";
import { vec2, vec3 } from "../../abstract-3d.js";
import type { PolygonStyle, zOrderElement } from "./svg-geometries/shared.js";
import { zElem } from "./svg-geometries/shared.js";
import { encodeElements } from "./svg-paths.js";

const point = (x: number, y: number): Vec2 => vec2(x, -y);
const square = (x: number, y: number, size: number): ReadonlyArray<Vec3> => [
  vec3(x, y, 0),
  vec3(x + size, y, 0),
  vec3(x + size, y + size, 0),
  vec3(x, y + size, 0),
];
const filled = (fill: string): PolygonStyle => ({ fill, opacity: 1, stroke: "rgb(0,0,0)", strokeWidth: 0 });
const sketched: PolygonStyle = { fill: "white", opacity: 1, stroke: "gray", strokeWidth: 3 };
const clear = "rgba(255,255,255,0)";
const polygon = (points: ReadonlyArray<Vec3>, style: PolygonStyle, edges?: ReadonlyArray<boolean>): zOrderElement => ({
  ...zElem("<polygon/>", 0, points, true, style),
  ...(edges && { edges }),
});
const encode = (...elements: ReadonlyArray<zOrderElement>): string => encodeElements(elements, point);

describe("encodeElements", () => {
  it("draws unstroked opaque polygons of one style, one after the other, as one path, wound one way", () => {
    // The second is given the other way around, and overlaps the first
    const reversed = [...square(1, 1, 2)].reverse();
    expect(encode(polygon(square(0, 0, 2), filled("red")), polygon(reversed, filled("red")))).toBe(
      `<path d="M0,0v-2h2v2zM1,-3h2v2h-2z" fill="red"/>`
    );
  });

  it("starts a new path where the style changes, in drawing order", () => {
    expect(encode(polygon(square(0, 0, 2), filled("red")), polygon(square(1, 1, 2), filled("blue")), polygon(square(2, 2, 2), filled("red")))).toBe(
      `<path d="M0,0v-2h2v2z" fill="red"/><path d="M1,-1v-2h2v2z" fill="blue"/><path d="M2,-2v-2h2v2z" fill="red"/>`
    );
  });

  it("draws stroked polygons of one style each as its own path, as one drawn later covers the stroke of an earlier, sharing the style in a group", () => {
    expect(encode(polygon(square(0, 0, 2), sketched), polygon(square(1, 1, 2), sketched))).toBe(
      `<g fill="white" stroke="gray" stroke-width="3"><path class="a3d-stroke" d="M0,0v-2h2v2z"/><path class="a3d-stroke" d="M1,-1v-2h2v2z"/></g>`
    );
  });

  it("fills a piece of a split polygon, and strokes it along its own edges, as one line, not the cut", () => {
    // The edge from the last point to the first is the cut
    expect(encode(polygon(square(0, 0, 2), sketched, [true, true, true, false]))).toBe(
      `<g fill="white" stroke="gray" stroke-width="3"><path d="M0,0v-2h2v2z" stroke="none"/><path class="a3d-stroke" d="M0,0h2v-2h-2" fill="none"/></g>`
    );
  });

  it("keeps other elements as they are, in drawing order", () => {
    const text = zElem("<text>1</text>", 0, [vec3(0, 0, 0)]);
    expect(encode(polygon(square(0, 0, 2), filled("red")), text, polygon(square(0, 0, 2), filled("red")))).toBe(
      `<path d="M0,0v-2h2v2z" fill="red"/><text>1</text><path d="M0,0v-2h2v2z" fill="red"/>`
    );
  });

  it("gives a single path its style itself, without a group", () => {
    expect(encode(polygon(square(0, 0, 2), sketched))).toBe(
      `<path class="a3d-stroke" d="M0,0v-2h2v2z" fill="white" stroke="gray" stroke-width="3"/>`
    );
  });

  it("leaves out polygons that are neither filled nor stroked", () => {
    expect(encode(polygon(square(0, 0, 2), filled(clear)))).toBe("");
  });

  it("draws stroked polygons that aren't filled, of one style, as one path, as they cover nothing, a piece along its own edges", () => {
    const outlined = { ...sketched, fill: clear };
    expect(encode(polygon(square(0, 0, 2), outlined), polygon(square(1, 1, 2), outlined, [true, true, true, false]))).toBe(
      `<path class="a3d-stroke" d="M0,0v-2h2v2zM1,-1h2v-2h-2" fill="none" stroke="gray" stroke-width="3"/>`
    );
  });

  it("gives a see-through fill its opacity, each polygon its own path, as they add up where they overlap", () => {
    const glass = { ...filled("blue"), opacity: 0.5 };
    expect(encode(polygon(square(0, 0, 2), glass), polygon(square(1, 1, 2), glass))).toBe(
      `<g fill="blue" fill-opacity="0.5"><path d="M0,0v-2h2v2z"/><path d="M1,-1v-2h2v2z"/></g>`
    );
  });
});
