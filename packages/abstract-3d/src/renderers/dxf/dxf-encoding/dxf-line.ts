import type { Vec3 } from "../../../abstract-3d.js";
import { type DxfColor, dxfColor } from "./dxf-color.js";
import { DXF_MODEL_SPACE_HANDLE, dxfHandleNext, dxfRound, type Handle } from "./dxf-common.js";

export function dxfEncLine(
  vecStart: Vec3,
  vecEnd: Vec3,
  col: DxfColor,
  handleRef: Handle
): string {
  return `  0
LINE
5
${dxfHandleNext(handleRef)}
330
${DXF_MODEL_SPACE_HANDLE}
100
AcDbEntity
${dxfColor(col)}
100
AcDbLine
10
${dxfRound(vecStart.x)}
20
${dxfRound(vecStart.y)}
30
${dxfRound(vecStart.z)}
11
${dxfRound(vecEnd.x)}
21
${dxfRound(vecEnd.y)}
31
${dxfRound(vecEnd.z)}
`;
}