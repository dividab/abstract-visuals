/* eslint-disable @typescript-eslint/no-unused-expressions */
import {
  Vec3,
  View,
  vec3Add,
  vec3,
  vec3Sub,
  vec3Scale,
  vec3Rot,
  bounds3FromVec3Array,
  bounds3ToSize,
  vec3Zero,
} from "../abstract-3d";

export function sizeCenterForCameraPos(
  size: Vec3,
  center: Vec3,
  rotation: Vec3,
  factor: number
): readonly [Vec3, Vec3] {
  const half = vec3Scale(size, 0.5);
  const min = vec3Sub(center, half);
  const max = vec3Add(center, half);
  const v1 = vec3Rot(vec3(min.x, min.y, max.z), center, rotation);
  const v2 = vec3Rot(vec3(max.x, min.y, max.z), center, rotation);
  const v3 = vec3Rot(vec3(max.x, max.y, max.z), center, rotation);
  const v4 = vec3Rot(vec3(min.x, max.y, max.z), center, rotation);
  const v5 = vec3Rot(vec3(min.x, min.y, min.z), center, rotation);
  const v6 = vec3Rot(vec3(max.x, min.y, min.z), center, rotation);
  const v7 = vec3Rot(vec3(max.x, max.y, min.z), center, rotation);
  const v8 = vec3Rot(vec3(min.x, max.y, min.z), center, rotation);
  const bounds = bounds3FromVec3Array([v1, v2, v3, v4, v5, v6, v7, v8]);
  return [vec3Scale(bounds3ToSize(bounds), factor), vec3Scale(center, factor)];
}

export function rotationForCameraPos(view: View): Vec3 {
  switch (view) {
    default:
    case "front":
      return vec3Zero;
    case "back":
      return vec3(-Math.PI, 0, -Math.PI);
    case "top":
      return vec3(Math.PI / 2, 0, 0);
    case "bottom":
      return vec3(-Math.PI / 2, 0, 0);
    case "right":
      return vec3(0, -Math.PI / 2, 0);
    case "left":
      return vec3(0, Math.PI / 2, 0);
  }
}

export function parseRgb(color: string): { readonly r: number; readonly g: number; readonly b: number } {
  const parts = color.split("(")[1]?.slice(0, -1).split(",");
  const rgb = { r: Number(parts?.[0] ?? 0), g: Number(parts?.[1] ?? 0), b: Number(parts?.[2] ?? 0) };
  return rgb;
}

export function parseColorString(s: string): { readonly r: number; readonly g: number; readonly b: number } {
  if (s.startsWith("#")) {
    if (s.length === 9) {
      return {
        // a: parseInt(s.slice(1, 3), 16),
        r: parseInt(s.slice(3, 5), 16),
        g: parseInt(s.slice(5, 7), 16),
        b: parseInt(s.slice(7, 9), 16),
      };
    }
    return { r: parseInt(s.slice(1, 3), 16), g: parseInt(s.slice(3, 5), 16), b: parseInt(s.slice(5, 7), 16) };
  }
  if (s.startsWith("rgb")) {
    const [r, g, b, _a] = s.split("(")[1]?.split(")")[0]?.split(",") ?? [];
    return { r: Number(r ?? 0), g: Number(g ?? 0), b: Number(b ?? 0) };
  }
  if (s === "white") {
    return white;
  }
  if (s === "black") {
    return black;
  }
  return white;
}

const white = { r: 255, g: 255, b: 255 };
const black = { r: 0, g: 0, b: 0 };

export function rgbGrayScale(color: string): string {
  const parts = color.split("(")[1]?.slice(0, -1).split(",");
  const c = Number(parts?.[0] ?? 416) * 0.3 + Number(parts?.[1] ?? 212) * 0.587 + Number(parts?.[2] ?? 1100) * 0.114;
  return `rgb(${c},${c},${c})`;
}

/**
 * This will take a HEX or RGB web color. pSBC can shade it darker or lighter,
 * or blend it with a second color, and can also pass it right thru but convert
 * from Hex to RGB (Hex2RGB) or RGB to Hex (RGB2Hex).
 * All without you even knowing what color format you are using.
 *
 * @param {number} p - From 0 to 1 Percentage float (Required).
 * @param {string} from - The starting color in HEX or RGB format.
 * @param {string} [to] - The ending color in HEX or RGB format, optional.
 * @returns {string|null} Either Hex or RGB color. Null if invalid color or percentage number.
 */

export function shade(p: number, from: string, to?: string): string | undefined {
  if (
    typeof p !== "number" ||
    p < -1 ||
    p > 1 ||
    typeof from !== "string" ||
    (from[0] !== "r" && from[0] !== "#") ||
    (to && typeof to !== "string")
  ) {
    return undefined; // ErrorCheck
  }

  const sbcRip = (d: string): Record<number, number> | null => {
    const l = d.length;
    const RGB: Record<number, number> = {};

    if (l > 9) {
      const dArr = d.split(",");
      if (dArr.length < 3 || dArr.length > 4) return null; // ErrorCheck
      RGB[0] = i(dArr[0].split("(")[1]);
      RGB[1] = i(dArr[1]);
      RGB[2] = i(dArr[2]);
      RGB[3] = dArr[3] ? parseFloat(dArr[3]) : -1;
    } else {
      if (l === 8 || l === 6 || l < 4) return null; // ErrorCheck
      if (l < 6) {
        d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (l > 4 ? String(d[4]) + d[4] : ""); // 3 or 4 digit
      }
      const dInt = i(d.slice(1), 16);
      RGB[0] = (dInt >> 16) & 255;
      RGB[1] = (dInt >> 8) & 255;
      RGB[2] = dInt & 255;
      RGB[3] = -1;

      if (l === 9 || l === 5) {
        RGB[3] = r((RGB[2] / 255) * 10000) / 10000;
        RGB[2] = RGB[1];
        RGB[1] = RGB[0];
        RGB[0] = (dInt >> 24) & 255;
      }
    }
    return RGB;
  };

  const i = parseInt;
  const r = Math.round;

  let h = from.length > 9;
  h = typeof to === "string" ? (to.length > 9 ? true : to === "c" ? !h : false) : h;
  const b = p < 0;
  p = b ? p * -1 : p;
  to = to && to !== "c" ? to : b ? "#000000" : "#FFFFFF";

  const f = sbcRip(from);
  const t = sbcRip(to);
  if (!f || !t) {
    return undefined; // ErrorCheck
  }

  if (h) {
    return (
      "rgb" +
      (f[3] > -1 || t[3] > -1 ? "a(" : "(") +
      r((t[0] - f[0]) * p + f[0]) +
      "," +
      r((t[1] - f[1]) * p + f[1]) +
      "," +
      r((t[2] - f[2]) * p + f[2]) +
      (f[3] < 0 && t[3] < 0
        ? ")"
        : "," + (f[3] > -1 && t[3] > -1 ? r(((t[3] - f[3]) * p + f[3]) * 10000) / 10000 : t[3] < 0 ? f[3] : t[3]) + ")")
    );
  }

  return (
    "#" +
    (
      0x100000000 +
      r((t[0] - f[0]) * p + f[0]) * 0x1000000 +
      r((t[1] - f[1]) * p + f[1]) * 0x10000 +
      r((t[2] - f[2]) * p + f[2]) * 0x100 +
      (f[3] > -1 && t[3] > -1
        ? r(((t[3] - f[3]) * p + f[3]) * 255)
        : t[3] > -1
        ? r(t[3] * 255)
        : f[3] > -1
        ? r(f[3] * 255)
        : 255)
    )
      .toString(16)
      .slice(1, f[3] > -1 || t[3] > -1 ? undefined : -2)
  );
}
