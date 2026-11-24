import { describe, expect, it } from "vitest";
import type { Scene } from "../../abstract-3d.js";
import { box, cylinder, group, image, line, plane, roundHole, shape, text, vec2, vec3, vec3TransRot, vec3Zero } from "../../abstract-3d.js";
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

  it("draws a cylinder as its outline, by arcs, not its facets, with its end toward the viewer, when nothing is drawn between them", () => {
    const pipe: Scene = {
      bounds: { min: vec3(-50, -10, -10), max: vec3(50, 10, 10) },
      groups: [group([cylinder(vec3Zero, 10, 100, teal, vec3(0, 0, Math.PI / 2))])],
    };
    const options = { only_stroke: true, stroke_thickness: 1 };
    // Side on, its ends are lines; turned toward the viewer, the near end is drawn over it
    expect(render(pipe, options).image.match(/<[a-z]+ /g)).toEqual(["<svg ", "<path "]);
    const turned = render(pipe, { ...options, view: vec3(0.5, 0.5, 0) }).image;
    expect(turned.match(/<[a-z]+ /g)).toEqual(["<svg ", "<path ", "<path "]);
    expect(turned).toMatch(/d="M[^"]*L[^"]*A10 [\d.]+ [-\d.]+ 0 0 [^"]*L[^"]*A10 [\d.]+ [-\d.]+ 0 0 [^"]*z"/);
  });

  it("draws a turned face's hole in its plane, where its center is in 3D, also left of the scene's center", () => {
    const [pos, rot] = [vec3(-150, 0, 0), vec3(0.4, -0.6, 0.3)];
    const center = vec3TransRot(vec3(-30, 20, 0), pos, rot);
    const holed: Scene = {
      bounds: { min: vec3(-260, -120, -120), max: vec3(0, 120, 120) },
      groups: [
        group([plane(pos, vec2(160, 140), teal, rot, [roundHole(vec2(-30, 20), 15)]), line(center, vec3(center.x + 1, center.y, center.z), 1, teal)]),
      ],
    };
    const image = render(holed, { only_stroke: true, stroke_thickness: 1 }).image;
    const [e = NaN, f = NaN] = /<circle[^>]* r="15" transform="matrix\(\S+ \S+ \S+ \S+ (\S+) (\S+)\)"/.exec(image)?.slice(1).map(Number) ?? [];
    const [x1 = NaN, y1 = NaN] = /<line[^>]* x1="(-?\d+)" y1="(-?\d+)"/.exec(image)?.slice(1).map(Number) ?? [];
    expect(Math.abs(e - x1)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(f - y1)).toBeLessThanOrEqual(0.5);
  });

  it("draws a view from a rotation of the scene, the top's as the top view", () => {
    const options = { only_stroke: true, stroke_thickness: 1 };
    expect(render(scene, { ...options, view: vec3(Math.PI / 2, 0, 0) }).image).toBe(render(scene, { ...options, view: "top" }).image);
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
