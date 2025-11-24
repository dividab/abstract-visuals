import { bounds2FromVec2Array, equals, Hole, vec2, Vec2, vec2Add, vec2Scale, vec2Sub, vec3, Vec3, vec3Rot, vec3Zero } from "../../abstract-3d.js";

export const svg = (width: number, height: number, children: string): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width.toFixed(0)} ${height.toFixed(
    0
  )}" width="${width.toFixed(0)}px" height="${height.toFixed(0)}px">${children} </svg>`;
};

export const svgLine = (p1: Vec2, p2: Vec2, stroke: string, strokeWidth: number): string =>
  `<line x1="${p1.x.toFixed(0)}" y1="${p1.y.toFixed(0)}" x2="${p2.x.toFixed(0)}" y2="${p2.y.toFixed(
    0
  )}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;

export function svgPolygon(factor: number, rot: Vec3, points: ReadonlyArray<Vec2>, fill: string, opacity: number, stroke: string, strokeWidth: number, holes?: ReadonlyArray<Hole>): string {
  const bounds = bounds2FromVec2Array(points);
  const size = vec2Sub(bounds.max, bounds.min);
  const [mask, maskAttribute] = svgHoleMask(factor, rot, size, holes ?? []);
  const pol = `<polygon points="${points
    .reduce((a, c) => (a += `${c.x.toFixed(0)},${c.y.toFixed(0)} `), "")
    .slice(0, -1)}" fill="${fill}" fill-opacity="${opacity.toFixed(1)}" stroke="${stroke}" stroke-width="${strokeWidth}" ${maskAttribute}/>`;
  return mask + pol;
}

export function svgCircle(radius: number, rot: Vec3, pos: Vec2, fill: string, opacity: number, stroke: string, strokeWidth: number, factor: number, holes?: ReadonlyArray<Hole>): string {
  const size = vec2Scale(vec2(radius, radius), 2);
  const [mask, maskAttribute] = svgHoleMask(factor, rot, size, holes ?? []);
  const cir = `<circle r="${radius.toFixed(0)}" cx="${pos.x.toFixed(0)}" cy="${pos.y.toFixed(0)}" fill="${fill}" fill-opacity="${opacity.toFixed(1)}" stroke="${stroke}" stroke-width="${strokeWidth}" ${maskAttribute}/>`;
  return mask + cir;
}

export const svgCircle2 = (radius: number, pos: Vec2, fill: string, stroke: string, strokeWidth: number, factor: number, holes?: ReadonlyArray<Hole>): string =>
  `<circle r="${radius.toFixed(0)}" cx="${pos.x.toFixed(0)}" cy="${pos.y.toFixed(
    0
  )}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;

function svgHoleMask(factor: number, rot: Vec3, size: Vec2, holes: ReadonlyArray<Hole>): [string, string] {
  const id = `mask_${counter()}`;
  return holes.length > 0 ? [
    `<mask id="${id}" mask-type="luminance" maskContentUnits="objectBoundingBox">
      <rect x="0" y="0" width="1" height="1" fill="white" />
      ${svgMaskHoles(factor, rot, size, holes ?? [])}
    </mask>\n`,
    `mask="url(#${id}) "`
  ] : [
    "",
    ""
  ];
}

function svgMaskHoles(factor: number, rot: Vec3, size: Vec2, holes: ReadonlyArray<Hole>): string {
  const holeMasks: Array<string> = [];
  for (const hole of holes) {
    const holePosRotated = vec3Rot(vec3(hole.pos.x, hole.pos.y, 0), vec3Zero, rot);
    const holePos = vec2Add(vec2Scale(holePosRotated, factor), vec2Scale(size, 0.5));
    switch (hole.type) {
      case "RoundHole": {
        const holeRad = hole.radius * factor;
        holeMasks.push(`<ellipse cx="${holePos.x / size.x}" cy="${holePos.y / size.y}" rx="${holeRad / size.x}" ry="${holeRad / size.y}" fill="black" />`);
        break;
      }
      case "SquareHole":
        const holeSizeRotated = vec3Rot(vec3(hole.size.x, hole.size.y, 0), vec3Zero, rot);
        const holeSizeAbs = vec2(Math.abs(holeSizeRotated.x), Math.abs(holeSizeRotated.y));
        const holeSize = vec2Scale(holeSizeAbs, factor);
        const halfSize = vec2Scale(holeSize, 0.5);
        holeMasks.push(`<rect x="${(holePos.x - halfSize.x) / size.x}" y="${(holePos.y - halfSize.y) / size.y}" width="${holeSize.x / size.x}" height="${holeSize.y / size.y}" fill="black" />`)
        break;
      default:
        break;
    }
  }
  return holeMasks.join("\n");
}

export const svgText = (text: string, matrix: string, color: string, font: string, fontSize: number): string =>
  `<text font-family="${font}" font-size="${fontSize}px" text-anchor="middle" alignment-baseline="middle" fill="${color}" transform="${matrix} ">${text}</text>`;

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
const counter = (() => {
  let counter = 0;
  return () => counter++;
})();