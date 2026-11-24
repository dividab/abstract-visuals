import { describe, expect, it } from "vitest";
import type { Scene } from "../../abstract-3d.js";
import { box, cylinder, group, image, shape, text, vec2, vec3, vec3Zero } from "../../abstract-3d.js";
import { render } from "./svg.js";

const teal = { normal: "rgb(43, 103, 119)" };
/** Two units side by side, the first with a closed cylinder toward the viewer on its front, as a thumbnail's */
const scene: Scene = {
  bounds: { min: vec3(-100, -50, -50), max: vec3(200, 50, 50) },
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

  it("draws a box's rounded corners as lines within half a unit of their quarter circle", () => {
    const rounded: Scene = {
      bounds: { min: vec3(-50, -50, -50), max: vec3(50, 50, 50) },
      groups: [group([box(vec3(100, 100, 100), teal, vec3Zero, vec3Zero, [], 10)])],
    };
    expect(render(rounded).image).toContain(
      `<path d="M-49,42v-81l2-5l3-3l5-2h81l5,2l3,3l2,5v81l-2,5l-3,3l-5,2h-81l-5-2l-3-3z" fill="rgb(43, 103, 119)"/>`
    );
  });

  it("leaves out what can't be seen: an image or an unstroked shape seen edge on, and an empty text", () => {
    const side = vec3(0, Math.PI / 2, 0);
    const hidden: Scene = {
      bounds: { min: vec3(-50, -50, -50), max: vec3(50, 50, 50) },
      groups: [
        group([
          image(vec3(100, 100, 0), teal, { type: "Url", url: "/picture.png" }, vec3Zero, side),
          shape([vec2(0, 0), vec2(10, 0), vec2(10, 10)], vec3Zero, teal, 0, side),
          text(vec3Zero, "", 10, teal),
          box(vec3(100, 100, 100), teal),
        ]),
      ],
    };
    expect(render(hidden, { only_stroke: true, stroke_thickness: 1 }).image.match(/<[a-z]+ /g)).toEqual(["<svg ", "<path "]);
  });

  it("draws a sketch on a background with each face its own path, as it covers the faces behind it, sharing their style in a group", () => {
    const { image } = render(scene, { only_stroke: true, stroke_thickness: 3, background: "rgb(255,255,255)" });
    expect(image.match(/<[a-z]+ /g)).toEqual(["<svg ", "<g ", "<path ", "<path ", "<circle "]);
  });
});
