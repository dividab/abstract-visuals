import type { Hole, Vec2, Vec3 } from "../../abstract-3d.js";
import { bounds2FromVec2Array, vec2, vec2Add, vec2Scale, vec2Sub, vec3, vec3Rot, vec3Zero } from "../../abstract-3d.js";
import { classNames } from "./class-names.js";
import type { PolygonStyle } from "./svg-geometries/shared.js";
import { isOpaque, svgTrsMatrix } from "./svg-geometries/shared.js";

export const svg = (min: Vec2, size: Vec2, children: string, className: string): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${className ? `${classNames.root} ${className}` : classNames.root}" viewBox="${min.x.toFixed(0)} ${min.y.toFixed(0)} ${size.x.toFixed(
    0
  )} ${size.y.toFixed(0)}" width="${size.x.toFixed(0)}px" height="${size.y.toFixed(0)}px">${shareStyles(children)}</svg>`;
};

const tagPattern = /<[a-z]+\b[^>]*>/g;
const styleAttributePattern = / (?:fill|fill-opacity|stroke|stroke-width|stroke-opacity|stroke-linecap|stroke-linejoin)="[^"]*"/g;

/**
 * The elements with each set of style attributes that's on more than one of them given once, in the svg's style, by a class named by its hash, the
 * same in every svg, so that svgs on one page share it
 */
function shareStyles(children: string): string {
  const tags = [...children.matchAll(tagPattern)];
  const keys: Array<string> = [];
  const counts = new Map<string, number>();
  for (const [tag] of tags) {
    const key = tag.match(styleAttributePattern)?.join("") ?? "";
    keys.push(key);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const names = new Map<string, string>();
  let [rules, shared, from] = ["", "", 0];
  for (let i = 0; i < tags.length; i++) {
    const [tag, key] = [tags[i]![0], keys[i]!];
    if (!key || counts.get(key)! < 2) {
      continue;
    }
    let name = names.get(key);
    if (!name) {
      // FNV-1a
      // oxlint-disable no-bitwise
      let hash = 0x811c9dc5;
      for (let k = 0; k < key.length; k++) {
        hash = Math.imul(hash ^ key.charCodeAt(k), 0x01000193);
      }
      name = `a3d-${(hash >>> 0).toString(36)}`;
      // oxlint-enable no-bitwise
      names.set(key, name);
      rules += `.${name}{${key.replace(/ ([a-z-]+)="([^"]*)"/g, ";$1:$2").slice(1)}}`;
    }
    const plain = tag.replace(styleAttributePattern, "");
    const classed = plain.includes(' class="') ? plain.replace(' class="', ` class="${name} `) : plain.replace(/^<[a-z]+/, `$& class="${name}"`);
    shared += children.slice(from, tags[i]!.index) + classed;
    from = tags[i]!.index + tag.length;
  }
  shared += children.slice(from);
  return rules ? `<style>${rules}</style>${shared}` : shared;
}
export const svgLine = (p1: Vec2, p2: Vec2, stroke: string, strokeWidth: number): string =>
  `<line class="${classNames.stroke}" x1="${p1.x.toFixed(0)}" y1="${p1.y.toFixed(0)}" x2="${p2.x.toFixed(0)}" y2="${p2.y.toFixed(
    0
  )}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;

export function svgPolygon(
  rot: Vec3,
  points: ReadonlyArray<Vec2>,
  fill: string,
  opacity: number,
  stroke: string,
  strokeWidth: number,
  holes?: ReadonlyArray<Hole>,
  _parentPos?: Vec3
): string {
  const bounds = bounds2FromVec2Array(points);
  const size = vec2Sub(bounds.max, bounds.min);
  const pos = vec2Scale(vec2Add(bounds.max, bounds.min), 0.5);
  const [mask, maskAttribute] = svgHoleMask(rot, size, holes ?? []);
  const pol = `<polygon class="${classNames.stroke}" points="${points
    .reduce((a, c) => (a += `${c.x.toFixed(0)},${c.y.toFixed(0)} `), "")
    .slice(0, -1)}" fill="${fill}" fill-opacity="${Number(opacity.toFixed(1))}" stroke="${stroke}" stroke-width="${strokeWidth}" ${maskAttribute}/>`;
  return mask + pol + svgStrokedHoles(pos, rot, holes ?? [], stroke, strokeWidth);
}

/** A closed cylinder or cone, by its ends' centers in view space and radii, drawn natively */
export type SvgCylinder = {
  readonly bottom: Vec3;
  readonly top: Vec3;
  readonly bottomRadius: number;
  readonly topRadius: number;
  readonly style: PolygonStyle;
};

/**
 * A closed cylinder or cone as seen: its ends' ellipses, their major axes across its axis on screen and their minor axes along it, joined by the
 * lines touching both, and over that the end toward the viewer. Not seen along its axis, when an end is a circle
 */
export function svgCylinder({ bottom, top, bottomRadius: r0, topRadius: r1, style }: SvgCylinder, point: (x: number, y: number) => Vec2): string {
  const [ax, ay, az] = [top.x - bottom.x, top.y - bottom.y, top.z - bottom.z];
  const across = Math.hypot(ax, ay);
  const m = vec2(ax / across, ay / across);
  const u = vec2(-m.y, m.x);
  const ends: Ends = { u, m, h: Math.abs(az) / Math.hypot(across, az), rotation: (Math.atan2(-u.y, u.x) * 180) / Math.PI, point };
  // The lines touch the ellipses where outer tangents would were they circles: θ either side of the minor axis, its cosine the ends' difference
  // in radius over their distance, the axis's length on screen over h
  const cos = ((r0 - r1) * ends.h) / across;
  const theta = Math.acos(Math.max(-1, Math.min(1, cos)));
  const [a, b] = [Math.PI / 2 - theta, Math.PI / 2 + theta];
  // Along one line, around the top's far side, back along the other, around the bottom's; with one end inside the other, its ellipse
  const outline =
    Math.abs(cos) >= 1
      ? getEllipse(cos > 0 ? bottom : top, Math.max(r0, r1), ends)
      : `M${getPoint(bottom, r0, a, ends)}L${getPoint(top, r1, a, ends)}${getArc(top, r1, b, 2 * theta, ends)}` +
        `L${getPoint(bottom, r0, b, ends)}${getArc(bottom, r0, a + 2 * Math.PI, 2 * Math.PI - 2 * theta, ends)}z`;
  const stroked = style.strokeWidth > 0 && isOpaque(style.stroke, 1);
  const filled = style.opacity > 0 && isOpaque(style.fill, 1);
  const opacity = filled && style.opacity < 1 ? ` fill-opacity="${Number(style.opacity.toFixed(1))}"` : "";
  const attributes = `fill="${filled ? style.fill : "none"}"${opacity}${stroked ? ` stroke="${style.stroke}" stroke-width="${style.strokeWidth}"` : ""}`;
  const [near, nearRadius] = az > 0 ? [top, r1] : [bottom, r0];
  // Not seen edge on, when it's the outline's end
  const cap =
    stroked && nearRadius > 0 && ends.h > 1e-6 ? `<path class="${classNames.stroke}" d="${getEllipse(near, nearRadius, ends)}" ${attributes}/>` : "";
  return `<path${stroked ? ` class="${classNames.stroke}"` : ""} d="${outline}" ${attributes}/>${cap}`;
}

/**
 * A cylinder's ends' ellipses: their major and minor axes on screen, the minor's length over the major's, the major's angle in the svg, and its
 * points
 */
type Ends = {
  readonly u: Vec2;
  readonly m: Vec2;
  readonly h: number;
  readonly rotation: number;
  readonly point: (x: number, y: number) => Vec2;
};

/** The point of an end's ellipse at the angle from its major axis toward its minor, in the svg */
function getPoint(center: Vec3, radius: number, angle: number, { u, m, h, point }: Ends): string {
  const [x, y] = [radius * Math.cos(angle), radius * h * Math.sin(angle)];
  const p = point(center.x + u.x * x + m.x * y, center.y + u.y * x + m.y * y);
  return `${p.x.toFixed(0)},${p.y.toFixed(0)}`;
}

/** Around an end's ellipse to the angle, by the span, unless it's a point */
function getArc(center: Vec3, radius: number, to: number, span: number, ends: Ends): string {
  const large = span > Math.PI ? 1 : 0;
  const [rx, ry, rotation] = [Number(radius.toFixed(1)), Number((radius * ends.h).toFixed(1)), Number(ends.rotation.toFixed(1))];
  return radius > 0 ? `A${rx} ${ry} ${rotation} ${large} 0 ${getPoint(center, radius, to, ends)}` : "";
}

function getEllipse(center: Vec3, radius: number, ends: Ends): string {
  const start = getPoint(center, radius, 0, ends);
  return `M${start}${getArc(center, radius, Math.PI, Math.PI, ends)}${getArc(center, radius, 2 * Math.PI, Math.PI, ends)}z`;
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
  const cir = `<circle class="${classNames.stroke}" r="${radius.toFixed(0)}" cx="${pos.x.toFixed(0)}" cy="${pos.y.toFixed(0)}" fill="${fill}" fill-opacity="${Number(opacity.toFixed(1))}" stroke="${stroke}" stroke-width="${strokeWidth}" ${maskAttribute}/>`;
  return mask + cir + svgStrokedHoles(pos, rot, holes ?? [], stroke, strokeWidth);
}

function svgStrokedHoles(pos: Vec2, rot: Vec3, holes: ReadonlyArray<Hole>, strokeColor: string, strokeThickness: number): string {
  if (strokeThickness <= Number.EPSILON) {
    return "";
  }

  let svgHoles = "";
  for (const hole of holes) {
    const localSvg = vec3(hole.pos.x, -hole.pos.y, 0);
    const rotated = vec3Rot(localSvg, vec3Zero, rot);
    const holeCenter = vec2Add(vec2(pos.x, pos.y), vec2(rotated.x, rotated.y));
    switch (hole.type) {
      case "RoundHole": {
        const matrix = svgTrsMatrix(holeCenter, vec3Zero);
        svgHoles += `<circle
          class="${classNames.stroke}"
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
        const points = [vec2(-half.x, -half.y), vec2(half.x, -half.y), vec2(half.x, half.y), vec2(-half.x, half.y)]
          .map((p) => `${p.x.toFixed(0)},${p.y.toFixed(0)}`)
          .join(" ");

        const matrix = svgTrsMatrix(holeCenter, rot);

        svgHoles += `<polygon
          class="${classNames.stroke}"
          points="${points}"
          transform="${matrix}"
          fill="none"
          stroke="${strokeColor}"
          stroke-width="${strokeThickness}"
        />`;
        break;
      }
      default:
        break;
    }
  }
  return svgHoles;
}

export const svgCircle2 = (radius: number, pos: Vec2, fill: string, stroke: string, strokeWidth: number, _holes?: ReadonlyArray<Hole>): string =>
  `<circle class="${classNames.stroke}" r="${radius.toFixed(0)}" cx="${pos.x.toFixed(0)}" cy="${pos.y.toFixed(
    0
  )}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;

function svgHoleMask(rot: Vec3, size: Vec2, holes: ReadonlyArray<Hole>): [string, string] {
  const id = `mask_${counter()}`;
  return holes.length > 0
    ? [
        `<mask id="${id}" mask-type="luminance" maskContentUnits="objectBoundingBox">
      <rect x="0" y="0" width="1" height="1" fill="white" />
      ${svgMaskHoles(rot, size, holes)}
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
          `<ellipse cx="${holePos.x / size.x}" cy="${holePos.y / size.y}" rx="${hole.radius / size.x}" ry="${hole.radius / size.y}" fill="black" />`
        );
        break;
      }
      case "SquareHole": {
        const holeSizeRotated = vec3Rot(vec3(hole.size.x, hole.size.y, 0), vec3Zero, rot);
        const holeSize = vec2(Math.abs(holeSizeRotated.x), Math.abs(holeSizeRotated.y));
        const halfSize = vec2Scale(holeSize, 0.5);
        holeMasks.push(
          `<rect x="${(holePos.x - halfSize.x) / size.x}" y="${(holePos.y - halfSize.y) / size.y}" width="${
            holeSize.x / size.x
          }" height="${holeSize.y / size.y}" fill="black" />`
        );
        break;
      }
      default:
        break;
    }
  }
  return holeMasks.join("\n");
}

export const svgText = (text: string, matrix: string, color: string, font: string, fontSize: number): string =>
  `<text font-family="${font}" font-size="${fontSize}px" text-anchor="middle" alignment-baseline="middle" fill="${color}" transform="${matrix}">${text}</text>`;

export type EmbededImage = { readonly type: "url"; readonly url: string } | { readonly type: "svg"; readonly svg: string };

export const rawSvgPrefix = "data:image/svg+xml,";

export const svgImage = (p: Vec2, size: Vec2, rot: Vec3, data: EmbededImage, background?: string, scale?: Vec2): string => {
  const matrix = svgTrsMatrix(p, rot, scale);

  if (data.type === "url") {
    const bg = background ? `<rect width="${size.x.toFixed(0)}" height="${size.y.toFixed(0)}" fill="${background}"/>` : "";
    return `<g transform="${matrix}">${bg}<image class="${classNames.image}" width="${size.x.toFixed(0)}" height="${size.y.toFixed(0)}" href="${data.url}"/></g>`;
  }

  // scale maps image-space coords → world coords, so the wrapper SVG and rect
  // must use image-space dimensions: imgW * scale.x = size.x (the desired world size).
  const imgW = scale ? size.x / Math.abs(scale.x) : size.x;
  const imgH = scale ? size.y / Math.abs(scale.y) : size.y;
  const bg = background ? `<rect width="${imgW.toFixed(0)}" height="${imgH.toFixed(0)}" fill="${background}"/>` : "";
  return `<g transform="${matrix}"><svg class="${classNames.image}" width="${imgW.toFixed(0)}" height="${imgH.toFixed(0)}">${bg}${data.svg}</svg></g>`;
};

const counter = (() => {
  let counter = 0;
  return () => counter++;
})();
