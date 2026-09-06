import { vec3, vec3Cross, vec3Normalize, type Vec3 } from "../../../abstract-3d.js";

export const DEFAULT_CIRCLE_SIDE_COUNT = 16;
export const DXF_FONT_SIZE_RATIO: number = 11.0 / 20.0;
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

/*
  given an extrusion vector(normal; tags 210/220/230),
  calculate the dxf OCS x and y axises used to project
  positions along
*/
export function dxfOCSXYAxis(normalizedExtrusionVector: Vec3): {
  readonly xAxis: Vec3;
  readonly yAxis: Vec3;
} {
  const THRESHOLD = 1.0 / 64.0; //dxf spec
  const xAxis =
    Math.abs(normalizedExtrusionVector.x) < THRESHOLD && Math.abs(normalizedExtrusionVector.y) < THRESHOLD
      ? vec3Normalize(vec3Cross(vec3(0.0, 1.0, 0.0), normalizedExtrusionVector))
      : vec3Normalize(vec3Cross(vec3(0.0, 0.0, 1.0), normalizedExtrusionVector));

  return {
    xAxis,
    yAxis: vec3Normalize(vec3Cross(normalizedExtrusionVector, xAxis)),
  };
}
