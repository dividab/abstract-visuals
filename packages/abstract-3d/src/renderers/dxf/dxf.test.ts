import { exhaustiveCheck } from "ts-exhaustive-check";
import { describe, expect, it } from "vitest";
import type { Scene, Vec3, View } from "../../abstract-3d.js";
import { box, sceneTextHeight, vec3, vec3Add, vec3Dot, vec3Normalize, vec3Scale, vec3Sub, vec3Zero, views } from "../../abstract-3d.js";
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
    center_deprecated: vec3(1000, 2000, 0),
    size_deprecated: vec3(400, 200, 100),
    groups: [{ pos: vec3(1000, 2000, 0), meshes: [box(vec3(400, 200, 100), black)] }],
    dimensions_deprecated: {
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
    center_deprecated: vec3Zero,
    size_deprecated: vec3(200, 200, 200),
    groups: [{ pos: vec3Zero, meshes: [box(vec3(200, 200, 200), black)] }],
    dimensions_deprecated: {
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
  // A unit seen from its other side is turned half about y, as (-π, 0, -π); quarter turns aren't drawn, `calculateVisibleViews` keeping the view's
  // own axis
  const rotations: ReadonlyArray<readonly [string, Vec3]> = [
    ["no rotation", vec3Zero],
    ["a half turn about y", vec3(0, Math.PI, 0)],
    ["a half turn about y as half turns about x and z", vec3(-Math.PI, 0, -Math.PI)],
  ];

  describe.each(rotations)("with %s", (_, rotation) => {
    it.each(views)("seen from the %s, read left to right over and under their lines, and up to the lines beside them", (view) => {
      const all = entities(render({ ...cube, rotation_deprecated: rotation }, { view, origin: "Center" }));
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
        // Left to right over or under the line, up beside it on its left, down beside it on its right, so the text's top faces away from the part
        const expected = Math.abs(out.y) >= Math.abs(out.x) ? vec3(1, 0, 0) : out.x < 0 ? vec3(0, 1, 0) : vec3(0, -1, 0);
        const mtext = named("MTEXT", text);
        expect({ text, drawn: mtext !== undefined }).toEqual({ text, drawn: true });
        const dir = vec3(value(mtext!, "11"), value(mtext!, "21"), value(mtext!, "31"));
        const normal = vec3(value(mtext!, "210"), value(mtext!, "220"), value(mtext!, "230"));
        expect({ text, dir: roundVec(dir), normal: roundVec(normal) }).toEqual({ text, dir: roundVec(expected), normal: vec3(0, 0, 1) });
      }
    });
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
