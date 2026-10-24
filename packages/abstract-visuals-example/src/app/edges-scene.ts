import type { BoxEdge, Scene } from "../../../abstract-3d/src/abstract-3d.js";
import { box, group, text, vec3, vec3Zero } from "../../../abstract-3d/src/abstract-3d.js";

/**
 * A corner piece, a cube with arms along x and z and a leg down, twice: with every edge rounded, so the seams between its boxes show, and with only
 * its outer edges rounded, each arm's edges at the cube kept sharp
 */

const material = { normal: "rgb(40, 40, 44)", type: "plastic" } as const;
const label = { normal: "rgb(90, 90, 90)" };
const radius = 6;

const cubeEdges: ReadonlyArray<BoxEdge> = ["TopBack", "TopLeft", "BackLeft"];
const armXEdges: ReadonlyArray<BoxEdge> = ["BottomBack", "TopBack", "BottomFront", "TopFront", "BackRight", "FrontRight", "BottomRight", "TopRight"];
const armZEdges: ReadonlyArray<BoxEdge> = ["BottomFront", "TopFront", "FrontLeft", "FrontRight", "BottomLeft", "BottomRight", "TopLeft", "TopRight"];
const legEdges: ReadonlyArray<BoxEdge> = [
  "BottomBack",
  "BottomFront",
  "BackLeft",
  "BackRight",
  "FrontLeft",
  "FrontRight",
  "BottomLeft",
  "BottomRight",
];

export const edgesScene: Scene = {
  size_deprecated: vec3(500, 240, 300),
  center_deprecated: vec3(180, 110, 20),
  groups: [false, true].map((outer, i) =>
    group(
      [
        box(vec3(40, 40, 40), material, vec3(0, 200, 0), vec3Zero, [], radius, outer ? cubeEdges : undefined),
        box(vec3(80, 40, 40), material, vec3(60, 200, 0), vec3Zero, [], radius, outer ? armXEdges : undefined),
        box(vec3(40, 40, 80), material, vec3(0, 200, 60), vec3Zero, [], radius, outer ? armZEdges : undefined),
        box(vec3(40, 160, 40), material, vec3(0, 100, 0), vec3Zero, [], radius, outer ? legEdges : undefined),
        text(vec3(40, 1, 160), outer ? "outer edges" : "all edges", 24, label, vec3(-Math.PI / 2, 0, 0)),
      ],
      vec3(i * 300, 0, 0)
    )
  ),
};
