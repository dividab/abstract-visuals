import { generateUUID } from "three/src/math/MathUtils.js";
import type { Bounds3, Vec3 } from "../../../abstract-3d.js";
import type { DxfDimensionDefinition } from "./dxf-dimension.js";
import { dxfEncFooter } from "./dxf-footer.js";
import { dxfEncHeader } from "./dxf-header.js";

export const DEFAULT_CIRCLE_SIDE_COUNT = 16;
export const DXF_FONT_SIZE_RATIO: number = 1.0 / 2.0;
export const DXF_DEFAULT_START_HANDLE = 0x1000;
export const DXF_MODEL_SPACE_HANDLE = "1D";
export const DXF_BLOCK_RECORD_TABLE_HANDLE = "1";

export type DxfOrigin = "BottomLeftFront" | "Center" | "SameAsScene";
export type Handle = { handle: number };

export function dxfHandleInit(): Handle {
  return {
    handle: DXF_DEFAULT_START_HANDLE,
  };
}

export function dxfHandleNext(handleRef: Handle): string {
  return (++handleRef.handle).toString(16).toUpperCase();
}

export function dxfRound(n: number): number {
  const d = 3;
  return Math.round((n + Number.EPSILON) * 10 ** d) / 10 ** d;
}

export function dxfBuild(groups: string, dimensions: DxfDimensionDefinition, bounds: Bounds3, size: Vec3, center: Vec3): string {
  const id = generateUUID();
  return dxfEncHeader(bounds, center, id, size, dimensions.block, dimensions.blockRecord) + groups + dimensions.entity + dxfEncFooter(id);
}