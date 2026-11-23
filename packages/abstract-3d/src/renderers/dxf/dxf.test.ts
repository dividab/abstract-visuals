import { exhaustiveCheck } from "ts-exhaustive-check";
import { describe, expect, it } from "vitest";
import type { Mesh, Scene, Vec3, View } from "../../abstract-3d.js";
import {
  bounds3FromPosAndSize,
  bounds3Zero,
  box,
  circleCurve,
  group,
  line,
  polygon,
  sceneTextHeight,
  shape,
  sphere,
  splineCurve,
  text,
  tube,
  vec2,
  vec3,
  vec3Add,
  vec3Cross,
  vec3Dot,
  vec3Length,
  vec3Normalize,
  vec3Scale,
  vec3Sub,
  vec3Zero,
  views,
} from "../../abstract-3d.js";
import { render } from "./dxf.js";

const black = { normal: "rgb(0, 0, 0)" };

/** The entities of a DXF, each as its group codes and values, in order */
function entities(dxf: string): ReadonlyArray<ReadonlyArray<readonly [string, string]>> {
  const lines = dxf.split("\n").map((line) => line.trim());
  const pairs = Array.from({ length: Math.floor(lines.length / 2) }, (_, i) => [lines.at(i * 2) ?? "", lines.at(i * 2 + 1) ?? ""] as const);
  return pairs.reduce<Array<Array<readonly [string, string]>>>((acc, pair) => {
    if (pair[0] === "0") {
      acc.push([pair]);
    } else {
      acc.at(-1)?.push(pair);
    }
    return acc;
  }, []);
}

const value = (entity: ReadonlyArray<readonly [string, string]>, code: string): number => Number(entity.find(([c]) => c === code)?.[1]);

describe("dxf dimensions", () => {
  // A scene off the origin, so the DXF's coordinates differ from the scene's
  const scene: Scene = {
    bounds: bounds3FromPosAndSize(vec3(1000, 2000, 0), vec3(400, 200, 100)),
    groups: [{ pos: vec3(1000, 2000, 0), meshes: [box(vec3(400, 200, 100), black)] }],
    dimensions: {
      material: black,
      dimensions: [
        { measurementStart: vec3(800, 1900, 0), measurementEnd: vec3(1200, 1900, 0), linePosition: vec3(1000, 1800, 0), views: ["front"] },
      ],
    },
  };

  it("draws the dimension line through the measured points, where the DIMENSION entity says it is", () => {
    const all = entities(render(scene, { origin: "Center" }));
    const dimension = all.find((e) => e.at(0)?.[1] === "DIMENSION");
    expect(dimension).toBeDefined();
    const [x1, x2, y] = [value(dimension!, "13"), value(dimension!, "14"), value(dimension!, "20")];
    // The block's lines along x: the dimension line, at the entity's line position, from one measured point to the other
    const horizontal = all.filter((e) => e.at(0)?.[1] === "LINE" && Math.abs(value(e, "20") - value(e, "21")) < 1e-6);
    expect(
      horizontal.some(
        (e) =>
          Math.abs(value(e, "20") - y) < 1e-3 &&
          Math.min(value(e, "10"), value(e, "11")) <= Math.min(x1, x2) + 1e-3 &&
          Math.max(value(e, "10"), value(e, "11")) >= Math.max(x1, x2) - 1e-3
      )
    ).toBe(true);
    // Every line of the block lies within reach of the measured points and the dimension line
    const lines = all.filter((e) => e.at(0)?.[1] === "LINE");
    const xs = lines.flatMap((e) => [value(e, "10"), value(e, "11")]);
    const ys = lines.flatMap((e) => [value(e, "20"), value(e, "21")]);
    const margin = 200;
    expect(Math.min(...xs)).toBeGreaterThan(Math.min(x1, x2) - margin);
    expect(Math.max(...xs)).toBeLessThan(Math.max(x1, x2) + margin);
    expect(Math.min(...ys)).toBeGreaterThan(Math.min(y, value(dimension!, "23")) - margin);
    expect(Math.max(...ys)).toBeLessThan(Math.max(y, value(dimension!, "23")) + margin);
  });

  it("scales the dimension style by the scene's text height, so CAD programs redrawing a dimension draw its text at the height drawn", () => {
    const dxf = render(scene, { origin: "Center" });
    // 32 for a scene this small, where the dimension style was always scaled by 44
    expect(sceneTextHeight(scene.groups)).toBe(32);
    expect(/\$DIMSCALE\s*\n\s*40\s*\n\s*(\S+)/.exec(dxf)?.at(1)).toBe("32");
  });
});

describe("dxf dimension texts", () => {
  /** Four dimensions on each side of a 200 cube, above, below, left and right of its face as the side's view sees it, each named by its text */
  const cube: Scene = {
    bounds: bounds3FromPosAndSize(vec3Zero, vec3(200, 200, 200)),
    groups: [{ pos: vec3Zero, meshes: [box(vec3(200, 200, 200), black)] }],
    dimensions: {
      material: black,
      dimensions: views.flatMap((view) => {
        const { right, up, normal } = dimensionViewBasis(view);
        const at = (r: number, u: number): Vec3 => vec3Add(vec3Scale(normal, 100), vec3Add(vec3Scale(right, r), vec3Scale(up, u)));
        return [
          { text: `${view} above`, measurementStart: at(-100, 100), measurementEnd: at(100, 100), linePosition: at(0, 180), views: [view] },
          { text: `${view} below`, measurementStart: at(-100, -100), measurementEnd: at(100, -100), linePosition: at(0, -180), views: [view] },
          { text: `${view} left`, measurementStart: at(-100, -100), measurementEnd: at(-100, 100), linePosition: at(-180, 0), views: [view] },
          { text: `${view} right`, measurementStart: at(100, -100), measurementEnd: at(100, 100), linePosition: at(180, 0), views: [view] },
        ];
      }),
    },
  };
  describe("each side", () => {
    it.each(views)("seen from the %s, read left to right over and under their lines, and up along the lines beside them", (view) => {
      const all = entities(render(cube, { view, origin: "Center" }));
      const named = (type: string, text: string): ReadonlyArray<readonly [string, string]> | undefined =>
        all.find((e) => e.at(0)?.[1] === type && e.some(([c, v]) => c === "1" && v === text));
      const dimensions = all.filter((e) => e.at(0)?.[1] === "DIMENSION");
      // The side facing the camera has its four dimensions drawn
      expect(dimensions).toHaveLength(4);
      for (const dimension of dimensions) {
        const text = dimension.find(([c]) => c === "1")?.[1] ?? "";
        const point = (x: string, y: string, z: string): Vec3 => vec3(value(dimension, x), value(dimension, y), value(dimension, z));
        const [ms, me, lp] = [point("13", "23", "33"), point("14", "24", "34"), point("10", "20", "30")];
        const along = vec3Normalize(vec3Sub(me, ms));
        const out = vec3Sub(vec3Sub(lp, ms), vec3Scale(along, vec3Dot(vec3Sub(lp, ms), along)));
        // In the drawing's plane, facing the camera
        expect([along.z, out.z, ms.z - lp.z].map((n) => Math.abs(n) < 1e-3)).toEqual([true, true, true]);
        // Left to right over or under the line, and bottom to top beside it on either side, as ISO 129's method 1
        const expected = Math.abs(out.y) >= Math.abs(out.x) ? vec3(1, 0, 0) : vec3(0, 1, 0);
        const mtext = named("MTEXT", text);
        expect({ text, drawn: mtext !== undefined }).toEqual({ text, drawn: true });
        const dir = vec3(value(mtext!, "11"), value(mtext!, "21"), value(mtext!, "31"));
        const normal = vec3(value(mtext!, "210"), value(mtext!, "220"), value(mtext!, "230"));
        expect({ text, dir: roundVec(dir), normal: roundVec(normal) }).toEqual({ text, dir: roundVec(expected), normal: vec3(0, 0, 1) });
      }
    });
  });
});

const meshEntities = (mesh: Mesh): ReadonlyArray<ReadonlyArray<readonly [string, string]>> =>
  entities(render({ bounds: bounds3Zero, groups: [group([mesh])] }, { origin: "SameAsScene" }));
const pointKey = (p: Vec3): string => [p.x, p.y, p.z].map((n) => n.toFixed(2)).join();

/** Each 3DFACE's corners, three if its last two are the same */
const faces = (mesh: Mesh): ReadonlyArray<ReadonlyArray<Vec3>> =>
  meshEntities(mesh)
    .filter((e) => e.at(0)?.[1] === "3DFACE")
    .map((e) => {
      const corners = ["0", "1", "2", "3"].map((k) => vec3(value(e, `1${k}`), value(e, `2${k}`), value(e, `3${k}`)));
      return vec3Length(vec3Sub(corners.at(2) ?? vec3Zero, corners.at(3) ?? vec3Zero)) < 1e-9 ? corners.slice(0, 3) : corners;
    });

const area = (mesh: Mesh): number =>
  faces(mesh).reduce(
    (sum, f) =>
      sum + f.slice(2).reduce((s, p, i) => s + vec3Length(vec3Cross(vec3Sub(f.at(i + 1) ?? p, f.at(0) ?? p), vec3Sub(p, f.at(0) ?? p))) / 2, 0),
    0
  );

/** Whether every edge is shared by two faces */
const closed = (mesh: Mesh): boolean => {
  const edges = faces(mesh).flatMap((f) => f.map((p, i) => [pointKey(p), pointKey(f.at((i + 1) % f.length) ?? p)].sort().join("|")));
  return edges.every((e) => edges.filter((other) => other === e).length === 2);
};

describe("dxf geometries", () => {
  const star = Array.from({ length: 10 }, (_, i) =>
    vec2((i % 2 ? 20 : 50) * Math.cos((i * Math.PI) / 5), (i % 2 ? 20 : 50) * Math.sin((i * Math.PI) / 5))
  );

  it("cuts a concave shape into triangles that cover it, whichever way its points go", () => {
    expect(area(shape(star, vec3Zero, black))).toBeCloseTo(10 * 500 * Math.sin(Math.PI / 5), 0);
    expect(area(shape([...star].reverse(), vec3Zero, black, 0, vec3(0.3, 0.8, 0.1)))).toBeCloseTo(10 * 500 * Math.sin(Math.PI / 5), 0);
  });

  it("closes a thick shape with walls, leaving out repeated points", () => {
    const l = shape(
      [vec2(0, 0), vec2(0, 100), vec2(50, 100), vec2(50, 50), vec2(50, 50), vec2(100, 50), vec2(100, 0), vec2(0, 0)],
      vec3Zero,
      black,
      10
    );
    expect(area(l)).toBeCloseTo(7500 * 2 + 400 * 10, 3);
    expect(closed(l)).toBe(true);
  });

  it("closes spheres and tubes", () => {
    const bend = splineCurve(Array.from({ length: 7 }, (_, i) => vec3(85.8 * Math.cos((i * Math.PI) / 12), 85.8 * Math.sin((i * Math.PI) / 12), 0)));
    const s = splineCurve([vec3(0, 0, 0), vec3(50, 20, 0), vec3(100, 0, 30)]);
    for (const mesh of [sphere(30, black), tube(bend, 11.5, black), tube(circleCurve(50, 0, Math.PI * 2), 5, black), tube(s, 5, black)]) {
      expect(closed(mesh)).toBe(true);
    }
  });

  it("draws a polygon's points as triangles unless they're a quad", () => {
    expect(faces(polygon([vec3(0, 0, 0), vec3(50, 0, 0), vec3(0, 50, 0), vec3(50, 0, 0), vec3(50, 50, 0), vec3(0, 50, 0)], black))).toHaveLength(2);
    expect(faces(polygon([vec3(0, 0, 0), vec3(50, 0, 0), vec3(50, 50, 0), vec3(0, 50, 0)], black)).map((f) => f.length)).toEqual([4]);
  });

  it("draws lines and text", () => {
    expect(meshEntities(line(vec3(0, 0, 0), vec3(100, 0, 0), 1, black)).filter((e) => e.at(0)?.[1] === "LINE")).toHaveLength(1);
    const mtext = meshEntities(text(vec3(10, 20, 0), "Hello", 20, black)).find((e) => e.at(0)?.[1] === "MTEXT");
    expect([mtext?.find(([c]) => c === "1")?.[1], value(mtext ?? [], "10"), value(mtext ?? [], "20")]).toEqual(["Hello", 10, 20]);
  });
});

const roundVec = (v: Vec3): Vec3 => vec3(Math.round(v.x) + 0, Math.round(v.y) + 0, Math.round(v.z) + 0);

/** The right, up and normal of a view, as the dimensions drawn for it see it */
function dimensionViewBasis(view: View): { readonly right: Vec3; readonly up: Vec3; readonly normal: Vec3 } {
  switch (view) {
    case "front":
      return { right: vec3(1, 0, 0), up: vec3(0, 1, 0), normal: vec3(0, 0, 1) };
    case "back":
      return { right: vec3(-1, 0, 0), up: vec3(0, 1, 0), normal: vec3(0, 0, -1) };
    case "left":
      return { right: vec3(0, 0, 1), up: vec3(0, 1, 0), normal: vec3(-1, 0, 0) };
    case "right":
      return { right: vec3(0, 0, -1), up: vec3(0, 1, 0), normal: vec3(1, 0, 0) };
    case "top":
      return { right: vec3(1, 0, 0), up: vec3(0, 0, -1), normal: vec3(0, 1, 0) };
    case "bottom":
      return { right: vec3(1, 0, 0), up: vec3(0, 0, 1), normal: vec3(0, -1, 0) };
    default:
      return exhaustiveCheck(view);
  }
}
