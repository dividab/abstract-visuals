import {
  bounds2FromVec2Array,
  equals,
  Hole,
  vec2,
  Vec2,
  vec2Add,
  vec2Scale,
  vec2Sub,
  vec3,
  Vec3,
  vec3Rot,
  vec3Zero,
} from "../../abstract-3d.js";
import { svgTrsMatrix } from "./svg-geometries/shared.js";

export const svg = (min: Vec2, size: Vec2, children: string): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${min.x.toFixed(0)} ${min.y.toFixed(0)} ${size.x.toFixed(
    0
  )} ${size.y.toFixed(0)}" width="${size.x.toFixed(0)}px" height="${size.y.toFixed(0)}px">${children}</svg>`;
};
export const svgLine = (p1: Vec2, p2: Vec2, stroke: string, strokeWidth: number): string =>
  `<line x1="${p1.x.toFixed(0)}" y1="${p1.y.toFixed(0)}" x2="${p2.x.toFixed(0)}" y2="${p2.y.toFixed(
    0
  )}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;

export function svgPolygon(
  rot: Vec3,
  points: ReadonlyArray<Vec2>,
  fill: string,
  opacity: number,
  stroke: string,
  strokeWidth: number,
  holes?: ReadonlyArray<Hole>
): string {
  const bounds = bounds2FromVec2Array(points);
  const size = vec2Sub(bounds.max, bounds.min);
  const pos = vec2Scale(vec2Add(bounds.max, bounds.min), 0.5);
  const [mask, maskAttribute] = svgHoleMask(rot, size, holes ?? []);
  const pol = `<polygon points="${points
    .reduce((a, c) => (a += `${c.x.toFixed(0)},${c.y.toFixed(0)} `), "")
    .slice(0, -1)}" fill="${fill}" fill-opacity="${opacity.toFixed(
    1
  )}" stroke="${stroke}" stroke-width="${strokeWidth}" ${maskAttribute}/>`;
  return mask + pol + svgStrokedHoles(pos, rot, holes ?? [], stroke, strokeWidth);
}

export function svgCircle(
  radius: number,
  rot: Vec3,
  pos: Vec2,
  fill: string,
  opacity: number,
  stroke: string,
  strokeWidth: number,
  holes?: ReadonlyArray<Hole>
): string {
  const size = vec2Scale(vec2(radius, radius), 2);
  const [mask, maskAttribute] = svgHoleMask(rot, size, holes ?? []);
  const cir = `<circle r="${radius.toFixed(0)}" cx="${pos.x.toFixed(0)}" cy="${pos.y.toFixed(
    0
  )}" fill="${fill}" fill-opacity="${opacity.toFixed(
    1
  )}" stroke="${stroke}" stroke-width="${strokeWidth}" ${maskAttribute}/>`;
  return mask + cir + svgStrokedHoles(pos, rot, holes ?? [], stroke, strokeWidth);
}

function svgStrokedHoles(
  pos: Vec2,
  rot: Vec3,
  holes: ReadonlyArray<Hole>,
  strokeColor: string,
  strokeThickness: number
): string {
  if (strokeThickness <= Number.EPSILON) {
    return "";
  }

  let svgHoles = "";
  for (const hole of holes) {
    const matrix = svgTrsMatrix(vec2Add(pos, hole.pos), rot);
    switch (hole.type) {
      case "RoundHole": {
        svgHoles += `<circle
          r="${hole.radius.toFixed(0)}"
          transform="${matrix}"
          fill="none"
          stroke="${strokeColor}"
          stroke-width="${strokeThickness}"
        />`;
        break;
      }

      case "SquareHole": {
        const half = vec2Scale(hole.size, 0.5);
        const points = [vec2(-half.x, half.y), vec2(half.x, half.y), vec2(half.x, -half.y), vec2(-half.x, -half.y)]
          .map((p) => `${p.x.toFixed(0)},${p.y.toFixed(0)}`)
          .join(" ");
        svgHoles += `<polygon 
          points="${points}"
          transform="${matrix}"
          fill="none"
          stroke="${strokeColor}"
          stroke-width="${strokeThickness}"
        />`;
        break;
      }
    }
  }
  return svgHoles;
}

export const svgCircle2 = (
  radius: number,
  pos: Vec2,
  fill: string,
  stroke: string,
  strokeWidth: number,
  holes?: ReadonlyArray<Hole>
): string =>
  `<circle r="${radius.toFixed(0)}" cx="${pos.x.toFixed(0)}" cy="${pos.y.toFixed(
    0
  )}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;

function svgHoleMask(rot: Vec3, size: Vec2, holes: ReadonlyArray<Hole>): [string, string] {
  const id = `mask_${counter()}`;
  return holes.length > 0
    ? [
        `<mask id="${id}" mask-type="luminance" maskContentUnits="objectBoundingBox">
      <rect x="0" y="0" width="1" height="1" fill="white" />
      ${svgMaskHoles(rot, size, holes ?? [])}
    </mask>\n`,
        `mask="url(#${id}) "`,
      ]
    : ["", ""];
}

function svgMaskHoles(rot: Vec3, size: Vec2, holes: ReadonlyArray<Hole>): string {
  const holeMasks: Array<string> = [];
  for (const hole of holes) {
    const holePosRotated = vec3Rot(vec3(hole.pos.x, hole.pos.y, 0), vec3Zero, rot);
    const holePos = vec2Add(holePosRotated, vec2Scale(size, 0.5));
    switch (hole.type) {
      case "RoundHole": {
        holeMasks.push(
          `<ellipse cx="${holePos.x / size.x}" cy="${holePos.y / size.y}" rx="${hole.radius / size.x}" ry="${
            hole.radius / size.y
          }" fill="black" />`
        );
        break;
      }
      case "SquareHole":
        const holeSizeRotated = vec3Rot(vec3(hole.size.x, hole.size.y, 0), vec3Zero, rot);
        const holeSize = vec2(Math.abs(holeSizeRotated.x), Math.abs(holeSizeRotated.y));
        const halfSize = vec2Scale(holeSize, 0.5);
        holeMasks.push(
          `<rect x="${(holePos.x - halfSize.x) / size.x}" y="${(holePos.y - halfSize.y) / size.y}" width="${
            holeSize.x / size.x
          }" height="${holeSize.y / size.y}" fill="black" />`
        );
        break;
      default:
        break;
    }
  }
  return holeMasks.join("\n");
}

export const svgText = (text: string, matrix: string, color: string, font: string, fontSize: number): string =>
  `<text font-family="${font}" font-size="${fontSize}px" text-anchor="middle" alignment-baseline="middle" fill="${color}" transform="${matrix}">${text}</text>`;

export type EmbededImage =
  | { readonly type: "url"; readonly url: string }
  | { readonly type: "svg"; readonly svg: string };

export const svgImage = (
  p: Vec2,
  size: Vec2,
  rot: Vec3,
  data: EmbededImage,
  background?: string,
  scale?: Vec2
): string => {
  const matrix = svgTrsMatrix(p, rot, scale);

  return `<g transform="${matrix}">
    ${
      data.type === "url"
        ? `${
            background ? `<rect width="${size.x.toFixed(0)}" height="${size.y.toFixed(0)}" fill="${background}"/>` : ""
          }
           <image width="${size.x.toFixed(0)}" height="${size.y.toFixed(0)}" href="${data.url}"/>`
        : `<svg width="${size.x.toFixed(0)}" height="${size.y.toFixed(0)}">
             ${background ? `<rect width="100%" height="100%" fill="${background}"/>` : ""}
             ${data.svg}
           </svg>`
    }
  </g>`;
};

const counter = (() => {
  let counter = 0;
  return () => counter++;
})();
