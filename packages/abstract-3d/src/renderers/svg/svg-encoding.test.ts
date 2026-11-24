import { describe, expect, it } from "vitest";
import { vec2, vec3Zero } from "../../abstract-3d.js";
import { svg, svgImage } from "./svg-encoding.js";

const getChildren = (image: string): string => image.slice(image.indexOf(">") + 1, -"</svg>".length);

describe("svg", () => {
  it("gives style attributes on more than one element once, in its style, by a class named by their hash, added to an element's own class", () => {
    const children = `<path d="M0,0h1" fill="red" stroke="blue"/><circle r="1" fill="blue"/><path class="a3d-stroke" d="M1,1h1" fill="red" stroke="blue"/>`;
    const shared = getChildren(svg(vec2(0, 0), vec2(10, 10), children, ""));
    const name = /<style>\.(a3d-[a-z0-9]+)\{fill:red;stroke:blue\}<\/style>/.exec(shared)?.[1];
    expect(shared).toBe(
      `<style>.${name}{fill:red;stroke:blue}</style><path class="${name}" d="M0,0h1"/><circle r="1" fill="blue"/><path class="${name} a3d-stroke" d="M1,1h1"/>`
    );
  });

  it("names a style the same in every svg, so svgs on one page share it", () => {
    const one = svg(vec2(0, 0), vec2(10, 10), `<path fill="red"/><path fill="red"/>`, "");
    const other = svg(vec2(0, 0), vec2(10, 10), `<circle fill="red"/><path fill="green"/><path fill="red"/>`, "");
    expect(/<style>(.*)<\/style>/.exec(one)?.[1]).toBe(/<style>(.*)<\/style>/.exec(other)?.[1]);
  });

  it("embeds an svg image by a matrix without trailing zeros", () => {
    const image = svgImage(vec2(1.5, 2), vec2(10, 10), vec3Zero, { type: "svg", svg: `<svg viewBox="0 0 1 1"/>` });
    expect(image).toBe(`<g transform="matrix(1 0 0 1 1.5 2)"><svg class="a3d-image" width="10" height="10"><svg viewBox="0 0 1 1"/></svg></g>`);
  });

  it("keeps style attributes on only one element as they are", () => {
    const children = `<path d="M0,0h1" fill="red"/><path d="M1,1h1" fill="green"/>`;
    expect(getChildren(svg(vec2(0, 0), vec2(10, 10), children, ""))).toBe(children);
  });
});
