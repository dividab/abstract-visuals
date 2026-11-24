import type { Vec2 } from "../../abstract-3d.js";
import { classNames } from "./class-names.js";
import type { zOrderElement } from "./svg-geometries/shared.js";
import { isOpaque } from "./svg-geometries/shared.js";

/**
 * The elements, in drawing order, as svg, with plain polygons as paths: those drawn one after the other with one style share its attributes in a
 * group, and are one path when none covers another's stroke: unstroked and opaque, as their union is the same filled at once, or stroked and not
 * filled. A piece of a split polygon is filled, then stroked along its own edges
 */
export function encodeElements(elements: ReadonlyArray<zOrderElement>, point: (x: number, y: number) => Vec2): string {
  let svg = "";
  // The run of polygons of one style so far: its attributes, whether it's one path, the class of its stroked paths, and its path data or paths
  let [attributes, merged, stroke, paths, count] = ["", false, "", "", 0];
  for (let i = 0; i <= elements.length; i++) {
    const { element = "", polygon = [], style, edges }: Partial<zOrderElement> = elements[i] ?? {};
    const plain = style && polygon.length >= 3;
    const stroked = plain && style.strokeWidth > 0 && isOpaque(style.stroke, 1);
    const filled = plain && style.opacity > 0 && isOpaque(style.fill, 1);
    if (plain && !stroked && !filled) {
      continue;
    }
    const fill = !plain
      ? ""
      : !filled
        ? `fill="none"`
        : `fill="${style.fill}"${style.opacity < 1 ? ` fill-opacity="${style.opacity.toFixed(1)}"` : ""}`;
    const own = stroked ? `${fill} stroke="${style.stroke}" stroke-width="${style.strokeWidth}"` : fill;
    // Rounded as toFixed(0) rounds the other elements, a half away from zero
    const screen: Array<Vec2> = [];
    for (const p of polygon) {
      const s = point(p.x, p.y);
      screen.push({ x: Math.sign(s.x) * Math.round(Math.abs(s.x)), y: Math.sign(s.y) * Math.round(Math.abs(s.y)) });
    }
    // Filled with others, a polygon that isn't convex may cross itself, and leave a hole where it's wound the other way: a path of its own
    const alone = filled && !stroked && !isConvex(screen);
    const next = alone ? "" : own;
    if (next !== attributes) {
      // One path has the attributes itself
      svg += !paths
        ? ""
        : merged
          ? `<path ${stroke}d="${paths}" ${attributes}/>`
          : count === 1
            ? paths.replace("/>", ` ${attributes}/>`)
            : `<g ${attributes}>${paths}</g>`;
      const one = !!plain && (stroked ? !filled : isOpaque(style.fill, style.opacity));
      [attributes, merged, stroke, paths, count] = [next, one, stroked ? `class="${classNames.stroke}" ` : "", "", 0];
    }
    if (!plain || alone) {
      svg += plain ? `<path d="${getPath(screen, undefined)}" ${own}/>` : element;
      continue;
    }
    if (merged) {
      paths += getPath(screen, stroked ? edges : undefined);
    } else if (stroked && edges) {
      paths += `<path d="${getPath(screen, undefined)}" stroke="none"/><path ${stroke}d="${getPath(screen, edges)}" fill="none"/>`;
      count += 2;
    } else {
      paths += `<path ${stroke}d="${getPath(screen, undefined)}"/>`;
      count++;
    }
  }
  return svg;
}

/** Whether the polygon turns the same way at every corner */
function isConvex(points: ReadonlyArray<Vec2>): boolean {
  let [min, max] = [0, 0];
  for (let i = 0; i < points.length; i++) {
    const o = points[i]!;
    const p = points[(i + 1) % points.length]!;
    const q = points[(i + 2) % points.length]!;
    const turn = (p.x - o.x) * (q.y - p.y) - (p.y - o.y) * (q.x - p.x);
    min = Math.min(min, turn);
    max = Math.max(max, turn);
  }
  return min === 0 || max === 0;
}

/**
 * A polygon as path data, its lines relative: closed, and wound one way so that overlapping ones in a path fill their union, or with `edges`, only
 * those edges of it, a run of them as one line
 */
function getPath(points: ReadonlyArray<Vec2>, edges: ReadonlyArray<boolean> | undefined): string {
  const n = points.length;
  const closed = !edges?.includes(false);
  let area = 0;
  for (let i = 0; i < n; i++) {
    const p = points[i]!;
    const q = points[(i + 1) % n]!;
    area += p.x * q.y - q.x * p.y;
  }
  // Backwards if it's closed and wound the other way; else from after an edge left out, so a run isn't broken where the points wrap around
  const step = closed && area < 0 ? n - 1 : 1;
  const start = closed ? 0 : edges!.indexOf(false) + 1;
  let d = "";
  for (let k = 0; k < n; k++) {
    const i = (start + k * step) % n;
    const p = points[i]!;
    const q = points[(i + step) % n]!;
    if (closed ? k === 0 : edges![i] && (k === 0 || !edges![(i + n - 1) % n])) {
      d += `M${p.x},${p.y}`;
    }
    if (closed ? k < n - 1 : edges![i]) {
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      d += dx === 0 && dy === 0 ? "" : dy === 0 ? `h${dx}` : dx === 0 ? `v${dy}` : `l${dx}${dy < 0 ? "" : ","}${dy}`;
    }
  }
  return closed ? `${d}z` : d;
}
