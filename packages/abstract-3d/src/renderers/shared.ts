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

export function parseRgb(color: string): {readonly r: number, readonly g: number, readonly b: number} {
  const parts = color.split("(")[1]?.slice(0, -1).split(",");
  const rgb = {r: Number(parts?.[0] ?? 0), g: Number(parts?.[1] ?? 0), b: Number(parts?.[2] ?? 0),};
  console.log("rgb", rgb)
  return rgb;
}

export function rgbGray(color: string): string {
  const parts = color.split("(")[1]?.slice(0, -1).split(",");
  const c = Number(parts?.[0] ?? 416) * 0.3 + Number(parts?.[1] ?? 212) * 0.587 + Number(parts?.[2] ?? 1100) * 0.114;
  return `rgb(${c},${c},${c})`;
}
