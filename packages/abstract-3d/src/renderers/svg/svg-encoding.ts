import { Vec2, vec2Add, vec2Scale } from "../../abstract-3d.js";

export const svg = (width: number, height: number, children: string, rotation: number | undefined): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width.toFixed(0)} ${height.toFixed(
    0
  )}" width="${width.toFixed(0)}px" height="${height.toFixed(0)}px" ${
    rotation ? `transform="rotate(${rotation} 50 50)"` : ""
  } >${children} </svg>`;

export const svgLine = (p1: Vec2, p2: Vec2, stroke: string, strokeWidth: number): string =>
  `<line x1="${p1.x.toFixed(0)}" y1="${p1.y.toFixed(0)}" x2="${p2.x.toFixed(0)}" y2="${p2.y.toFixed(
    0
  )}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;

export const svgPolygon = (points: ReadonlyArray<Vec2>, fill: string, stroke: string, strokeWidth: number): string =>
  `<polygon points="${points
    .reduce((a, c) => (a += `${c.x.toFixed(0)},${c.y.toFixed(0)} `), "")
    .slice(0, -1)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;

export const svgCircle = (radius: number, pos: Vec2, fill: string, stroke: string, strokeWidth: number): string =>
  `<circle r="${radius.toFixed(0)}" cx="${pos.x.toFixed(0)}" cy="${pos.y.toFixed(
    0
  )}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;

export const svgText = (p: Vec2, text: string, rot: number, color: string, font: string, fontSize: number): string =>
  `<text font-family="${font}" font-size="${fontSize}px" text-anchor="middle" alignment-baseline="middle" fill="${color}" transform="${translate(
    p
  )} ${rotate(rot)}">${text}</text>`;

export type EmbededImage =
  | { readonly type: "url"; readonly url: string }
  | { readonly type: "svg"; readonly svg: string };

export const svgImage = (p: Vec2, size: Vec2, rot: number, data: EmbededImage): string => {
  const half = vec2Scale(size, 0.5);
  return data.type === "url"
    ? `<image x="${p.x.toFixed(0)}" y="${p.y.toFixed(0)}" transform="${rotate(rot)}" ${transformOrigin(
        p,
        half
      )} width="${size.x.toFixed(0)}" height="${size.y.toFixed(0)}" href="${data.url}" />`
    : `<svg width="${size.x.toFixed(0)}" height="${size.y.toFixed(0)}" transform="${translate(
        vec2Add(p, half)
      )} ${rotate(rot)} ${translate(vec2Scale(half, -1))}">${data.svg}</svg>

  `;
};

const transformOrigin = (p: Vec2, half: Vec2): string =>
  `transform-origin="${(p.x + half.x).toFixed(0)}px ${(p.y + half.y).toFixed(0)}px"`;

const rotate = (rot: number): string => `rotate(${rot.toFixed(0)})`;

const translate = (p: Vec2): string => `translate(${p.x.toFixed(0)}, ${p.y.toFixed(0)})`;
