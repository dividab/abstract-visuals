import { describe, expect, it } from "vitest";
import type { Mesh } from "../../abstract-3d.js";
import {
  bounds3Zero,
  box,
  circleCurve,
  cone,
  culledLine,
  cylinder,
  group,
  line,
  plane,
  polygon,
  roundHole,
  shape,
  sphere,
  splineCurve,
  squareHole,
  text,
  tube,
  vec2,
  vec3,
  vec3Zero,
} from "../../abstract-3d.js";
import { render } from "./step.js";

const red = { normal: "rgb(255, 0, 0)" };
const step = (meshes: ReadonlyArray<Mesh>, rot = vec3Zero): string => render({ bounds: bounds3Zero, groups: [group(meshes, vec3(10, 20, 30), rot)] });
const count = (s: string, entity: string): number => s.split(` = ${entity}(`).length - 1;
const refs = (s: string): ReadonlyArray<string> => Array.from(s.matchAll(/#(\d+)/g), (match) => match.at(1) ?? "");

/**
 * Per solid, whether every edge is walked once each way by its faces' loops, as in a closed shell; an edge's sense in a loop flips if the loop's face
 * bound is reversed
 */
function closedSolids(s: string): ReadonlyArray<boolean> {
  const byId = new Map(Array.from(s.matchAll(/^#(\d+) = (.*);$/gm), (match) => [match.at(1), match.at(2) ?? ""]));
  const get = (id: string | undefined): string => byId.get(id) ?? "";
  return Array.from(byId.values())
    .filter((e) => e.startsWith("MANIFOLD_SOLID_BREP("))
    .map((brep) => {
      const uses = refs(get(refs(brep).at(0))).flatMap((face) =>
        refs(get(face))
          .slice(0, -1)
          .flatMap((bound) => {
            const [loop] = refs(get(bound));
            const reversed = get(bound).endsWith(".F.)");
            return get(loop).startsWith("EDGE_LOOP(")
              ? refs(get(loop)).map((edge) => ({ edge: refs(get(edge)).at(0), forward: get(edge).endsWith(".T.)") !== reversed }))
              : [];
          })
      );
      return Array.from(new Set(uses.map((use) => use.edge))).every((edge) => {
        const u = uses.filter((use) => use.edge === edge);
        return u.length === 2 && u.some((use) => use.forward) && u.some((use) => !use.forward);
      });
    });
}

describe("step", () => {
  const holedBox = box(vec3(100, 50, 20), red, vec3Zero, vec3Zero, [roundHole(vec2(-20, 0), 10), squareHole(vec2(25, 0), vec2(20, 10))]);
  const ball = sphere(10, red);
  const arc = tube(circleCurve(50, 1, -Math.PI / 2), 5, red);
  const ring = tube(circleCurve(50, 0, Math.PI * 2), 5, red);
  const meshes: ReadonlyArray<readonly [string, Mesh, number]> = [
    ["box", box(vec3(100, 50, 20), red), 1],
    ["box with holes", holedBox, 1],
    ["plane with a hole", plane(vec3Zero, vec2(100, 50), red, vec3Zero, [roundHole(vec2(0, 0), 10)]), 1],
    ["shape", shape([vec2(0, 0), vec2(0, 100), vec2(50, 100), vec2(50, 50), vec2(100, 50), vec2(100, 0)], vec3Zero, red, 10), 1],
    ["flat shape", shape([vec2(0, 0), vec2(100, 0), vec2(0, 100)], vec3Zero, red), 1],
    ["polygon, a triangle", polygon([vec3(0, 0, 0), vec3(100, 0, 0), vec3(0, 100, 0)], red), 1],
    ["polygon, a bent quad", polygon([vec3(0, 0, 0), vec3(100, 0, 0), vec3(100, 100, 50), vec3(0, 100, 0)], red), 2],
    ["sphere", ball, 1],
    ["tube along an arc", arc, 1],
    ["tube around a circle", ring, 1],
    ["tube along a spline", tube(splineCurve([vec3(0, 0, 0), vec3(50, 20, 0), vec3(100, 0, 30)]), 5, red), 1],
    ["cylinder", cylinder(vec3Zero, 20, 50, red), 1],
    ["tapered cylinder", cylinder(vec3Zero, 20, 50, red, vec3Zero, false, [], 0, Math.PI * 2, 10), 1],
    ["part of a cylinder", cylinder(vec3Zero, 20, 50, red, vec3Zero, false, [], 1, -Math.PI * 1.5), 1],
    ["part of a tapered cylinder", cylinder(vec3Zero, 20, 50, red, vec3Zero, false, [], 0, Math.PI / 2, 10), 1],
    ["open cylinder", cylinder(vec3Zero, 20, 50, red, vec3Zero, true), 1],
    [
      "cylinder with holes",
      cylinder(vec3Zero, 50, 20, red, vec3Zero, false, [roundHole(vec2(20, 0), 10), squareHole(vec2(-20, 0), vec2(10, 10))]),
      1,
    ],
    ["cone", cone(vec3Zero, 20, 50, red), 1],
  ];

  it.each(meshes)("exports a %s as closed solids", (_, mesh, solids) => {
    for (const rot of [vec3Zero, vec3(0.4, 0.2, 0.7)]) {
      const s = step([mesh], rot);
      expect(closedSolids(s)).toEqual(Array<boolean>(solids).fill(true));
      expect(count(s, "PRODUCT")).toBe(1);
    }
  });

  it("cuts a box's round hole with a cylindrical wall and its square hole with flat ones", () => {
    const s = step([holedBox]);
    expect(count(s, "CYLINDRICAL_SURFACE")).toBe(1);
    expect(count(s, "ADVANCED_FACE")).toBe(6 + 4 + 1);
  });

  it("exports an open cylinder as a thin wall, and a part of one closed by flat walls", () => {
    const open = step([cylinder(vec3Zero, 20, 50, red, vec3Zero, true)]);
    expect([count(open, "CYLINDRICAL_SURFACE"), count(open, "PLANE")]).toEqual([2, 2]);
    const part = step([cylinder(vec3Zero, 20, 50, red, vec3Zero, false, [], 0, Math.PI)]);
    expect([count(part, "CYLINDRICAL_SURFACE"), count(part, "PLANE")]).toEqual([1, 4]);
  });

  it("leaves out a shape's repeated points and points on a straight side", () => {
    const s = step([shape([vec2(0, 0), vec2(0, 50), vec2(0, 100), vec2(100, 100), vec2(100, 100), vec2(100, 0), vec2(0, 0)], vec3Zero, red, 10)]);
    expect(closedSolids(s)).toEqual([true]);
    expect(count(s, "ADVANCED_FACE")).toBe(6);
  });

  it("exports a sphere and tubes along circles exactly", () => {
    expect(count(step([ball]), "SPHERICAL_SURFACE")).toBe(1);
    const arcStep = step([arc]);
    expect([count(arcStep, "TOROIDAL_SURFACE"), count(arcStep, "PLANE")]).toEqual([1, 2]);
    const ringStep = step([ring]);
    expect([count(ringStep, "TOROIDAL_SURFACE"), count(ringStep, "ADVANCED_FACE")]).toEqual([1, 1]);
  });

  it("exports a tube along a spline through points on an arc, e.g. a bend, as a torus", () => {
    const bend = Array.from({ length: 7 }, (_, i) => vec3(85.8 * Math.cos((i * Math.PI) / 12), 85.8 * Math.sin((i * Math.PI) / 12), 0));
    const s = step([tube(splineCurve(bend), 11.5, red)]);
    expect([count(s, "TOROIDAL_SURFACE"), count(s, "ADVANCED_FACE")]).toEqual([1, 3]);
    expect(closedSolids(s)).toEqual([true]);
  });

  it("rings a tube along a spline by how much it turns", () => {
    const straight = step([tube(splineCurve([vec3(0, 0, 0), vec3(50, 0, 0), vec3(100, 0, 0)]), 5, red)]);
    // Two segments of 12 sides, two triangles each, and the ends
    expect(count(straight, "ADVANCED_FACE")).toBe(2 * 12 * 2 + 2);
  });

  it("exports lines as wires", () => {
    const s = step([line(vec3(0, 0, 0), vec3(100, 0, 0), 1, red), culledLine(vec3(0, 0, 0), vec3(0, 100, 0), vec3(0, 0, 1), 1, red)]);
    expect([count(s, "POLYLINE"), count(s, "GEOMETRICALLY_BOUNDED_WIREFRAME_SHAPE_REPRESENTATION"), count(s, "MANIFOLD_SOLID_BREP")]).toEqual([
      2, 2, 0,
    ]);
  });

  it("makes a product of each mesh, also of meshes alike", () => {
    const s = step([box(vec3(1, 1, 1), red), box(vec3(1, 1, 1), red, vec3(5, 0, 0))]);
    expect([count(s, "PRODUCT"), count(s, "PRODUCT_DEFINITION"), count(s, "SHAPE_DEFINITION_REPRESENTATION")]).toEqual([2, 2, 2]);
  });

  it("colors by hex and rgb() colors alike", () => {
    expect(step([box(vec3(1, 1, 1), { normal: "#F4F8F4" })])).toContain("COLOUR_RGB('',0.957,0.973,0.957)");
    expect(step([box(vec3(1, 1, 1), { normal: "rgb(244, 248, 244)" })])).toContain("COLOUR_RGB('',0.957,0.973,0.957)");
  });

  it("leaves out text", () => {
    expect(count(step([text(vec3Zero, "text", 10, red)]), "PRODUCT")).toBe(0);
  });
});
