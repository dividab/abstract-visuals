import { vec2, Vec2, vec2Add, vec2Scale } from "../../abstract-3d.js";

export const svg = (width: number, height: number, children: string): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width.toFixed(0)} ${height.toFixed(
    0
  )}" width="${width.toFixed(0)}px" height="${height.toFixed(0)}px">${children} </svg>`;
};

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
  const rad = rot * (Math.PI / 180);
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const newSize = vec2(size.x * cos + size.y * sin, size.x * sin + size.y * cos);
  const half = vec2Scale(size, 0.5);
  const originalCenter = vec2(size.x / 2, size.y / 2);
  const rotatedCenter = vec2(newSize.x / 2, newSize.y / 2);
  const delta = vec2(originalCenter.x - rotatedCenter.x, originalCenter.y - rotatedCenter.y);
  const [newSizeX, newSizeY] = [newSize.x.toFixed(0), size.y.toFixed(0)];
  if (newSizeX === "0" || newSizeY === "0") {
    return "";
  }

  return data.type === "url"
    ? `<image width="${newSizeX}" height="${newSizeY}" x="${p.x.toFixed(0)}" y="${p.y.toFixed(0)}" transform="${rotate(
        rot
      )}" ${transformOrigin(p, half)} href="${data.url}" />`
    : `<svg width="${newSize.x.toFixed(0)}" height="${newSize.y.toFixed(0)}" transform="${translate(p)} ${rotateAtPos(
        rot,
        half
      )} ${translate(delta)}">${data.svg}</svg>
  `;
};

const transformOrigin = (p: Vec2, half: Vec2): string =>
  `transform-origin="${(p.x + half.x).toFixed(0)}px ${(p.y + half.y).toFixed(0)}px"`;

const rotate = (rot: number): string => `rotate(${rot.toFixed(0)})`;
const rotateAtPos = (rot: number, p: Vec2): string => `rotate(${rot.toFixed(0)}, ${p.x.toFixed(0)}, ${p.y.toFixed(0)})`;
const translate = (p: Vec2): string => `translate(${p.x.toFixed(0)}, ${p.y.toFixed(0)})`;
