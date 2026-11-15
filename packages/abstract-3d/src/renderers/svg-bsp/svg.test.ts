import { describe, expect, it } from "vitest";
import type { Scene } from "../../abstract-3d.js";
import { box, cylinder, group, vec3 } from "../../abstract-3d.js";
import { render } from "./svg.js";

const teal = { normal: "rgb(43, 103, 119)" };
/** Two units side by side, the first with a closed cylinder toward the viewer on its front, as a thumbnail's */
const scene: Scene = {
  size_deprecated: vec3(300, 100, 100),
  center_deprecated: vec3(50, 0, 0),
  groups: [
    group([box(vec3(100, 100, 100), teal, vec3(-50, 0, 0)), cylinder(vec3(-50, 0, 55), 10, 10, teal, vec3(Math.PI / 2, 0, 0))]),
    group([box(vec3(200, 100, 100), teal, vec3(100, 0, 0))]),
  ],
};

describe("render", () => {
  it("draws a sketch on a see-through background as one path of outlines per color, and a cylinder toward the viewer as only its circle", () => {
    const { image } = render(scene, { only_stroke: true, stroke_thickness: 3 });
    expect(image.match(/<[a-z]+ /g)).toEqual(["<svg ", "<path ", "<circle "]);
    expect(image).toContain(
      `<path class="a3d-stroke" d="M-148,52v-100h100v100zM-48,52v-100h200v100z" fill="none" stroke="rgb(43, 103, 119)" stroke-width="3"/>`
    );
  });

  it("draws a sketch on a background with each face its own path, as it covers the faces behind it, sharing their style in a group", () => {
    const { image } = render(scene, { only_stroke: true, stroke_thickness: 3, background: "rgb(255,255,255)" });
    expect(image.match(/<[a-z]+ /g)).toEqual(["<svg ", "<g ", "<path ", "<path ", "<circle "]);
  });
});
