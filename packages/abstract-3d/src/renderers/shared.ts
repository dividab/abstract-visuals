import {
  Vec3,
  View,
  DimensionBounds,
  vec3Add,
  vec3,
  vec3Sub,
  vec3Scale,
  vec3Rot,
  bounds3FromVec3Array,
  bounds3ToSize,
  vec3Zero,
  bounds3Zero,
} from "../abstract-3d.js";

export function sizeCenterForCameraPos(
  size: Vec3,
  center: Vec3,
  _dimBound: DimensionBounds | undefined,
  rotation: Vec3,
  _view: View,
  factor: number
): readonly [Vec3, Vec3] {
  // const [sizeAdj, centerAdj] = (() => {
  //   switch (view) {
  //     case "front":
  //     default:
  //       return [
  //         vec3Add(size, vec3(dimBound.front.min.x + dimBound.front.max.x, dimBound.front.min.y + dimBound.front.max.y, 0)),
  //         vec3Add(center, vec3((dimBound.front.max.x - dimBound.front.min.x) / 2, (dimBound.front.max.y - dimBound.front.min.y) / 2, 0)),
  //       ];
  //     case "back":
  //       return [
  //         vec3Add(size, vec3(dimBound.back.min.x + dimBound.back.max.x, dimBound.back.min.y + dimBound.back.max.y, 0)),
  //         vec3Add(center, vec3((dimBound.back.max.x - dimBound.back.min.x) / 2, (dimBound.back.max.y - dimBound.back.min.y) / 2, 0)),
  //       ];
  //     case "top":
  //       return [
  //         vec3Add(size, vec3(dimBound.top.min.x + dimBound.top.max.x, 0, dimBound.top.min.y + dimBound.top.max.y)),
  //         vec3Add(center, vec3((dimBound.top.max.x - dimBound.top.min.x) / 2, (dimBound.top.max.y - dimBound.top.min.y) / 2, 0)),
  //       ];
  //     case "bottom":
  //       return [
  //         vec3Add(size, vec3(dimBound.bottom.min.x + dimBound.bottom.max.x, 0, dimBound.bottom.min.y + dimBound.bottom.max.y)),
  //         vec3Add(center, vec3((dimBound.bottom.max.x - dimBound.bottom.min.x) / 2, (dimBound.bottom.max.y - dimBound.bottom.min.y) / 2, 0)),
  //       ];
  //     case "right":
  //       return [
  //         vec3Add(size, vec3(0, dimBound.right.min.y + dimBound.right.max.y, dimBound.right.min.x + dimBound.right.max.x)),
  //         vec3Add(center, vec3((dimBound.right.max.x - dimBound.right.min.x) / 2, (dimBound.right.max.y - dimBound.right.min.y) / 2, 0)),
  //       ];
  //     case "left":
  //       return [
  //         vec3Add(size, vec3(0, dimBound.left.min.y + dimBound.left.max.y, dimBound.left.min.x + dimBound.left.max.x)),
  //         vec3Add(center, vec3((dimBound.left.max.x - dimBound.left.min.x) / 2, (dimBound.left.max.y - dimBound.left.min.y) / 2, 0)),
  //       ];
  //   }
  // })();

  const [sizeAdj, centerAdj] = (() => {
    return [size, center];
  })();

  const half = vec3Scale(sizeAdj, 0.5);
  const min = vec3Sub(centerAdj, half);
  const max = vec3Add(centerAdj, half);
  const v1 = vec3Rot(vec3(min.x, min.y, max.z), centerAdj, rotation);
  const v2 = vec3Rot(vec3(max.x, min.y, max.z), centerAdj, rotation);
  const v3 = vec3Rot(vec3(max.x, max.y, max.z), centerAdj, rotation);
  const v4 = vec3Rot(vec3(min.x, max.y, max.z), centerAdj, rotation);
  const v5 = vec3Rot(vec3(min.x, min.y, min.z), centerAdj, rotation);
  const v6 = vec3Rot(vec3(max.x, min.y, min.z), centerAdj, rotation);
  const v7 = vec3Rot(vec3(max.x, max.y, min.z), centerAdj, rotation);
  const v8 = vec3Rot(vec3(min.x, max.y, min.z), centerAdj, rotation);
  const bounds = bounds3FromVec3Array([v1, v2, v3, v4, v5, v6, v7, v8]);
  return [vec3Scale(bounds3ToSize(bounds), factor), vec3Scale(centerAdj, factor)];
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

export const dimBoundZero: DimensionBounds = {
  front: bounds3Zero,
  back: bounds3Zero,
  top: bounds3Zero,
  bottom: bounds3Zero,
  right: bounds3Zero,
  left: bounds3Zero,
  threeD: bounds3Zero,
};

export function rgbGray(color: string): string {
  const parts = color.split("(")[1]?.slice(0, -1).split(",");
  const c = Number(parts?.[0] ?? 416) * 0.3 + Number(parts?.[1] ?? 212) * 0.587 + Number(parts?.[2] ?? 1100) * 0.114;
  return `rgb(${c},${c},${c})`;
}
