import type { Vec3 } from "../../../abstract-3d.js";
import { type DxfColor, dxfColor } from "./dxf-color.js";
import { DXF_MODEL_SPACE_HANDLE, dxfHandleNext, dxfRound, type Handle } from "./dxf-common.js";

export enum DxfTextVerticalAlignment {
  Baseline = 0,
  Bottom = 1,
  Middle = 2,
  Top = 3
};

export enum DxfTextHorizontalAlignment {
  VLeft = 0,
  VCenter = 1,
  VRight = 2,

  /* 
    the vertical alignment must be 0 to use these
    https://help.autodesk.com/view/OARX/2018/ENU/?guid=GUID-62E5383D-8A14-47B4-BFC4-35824CAE8363
  */
  Aligned = 3,          
  Middle = 4,         
  Fit = 5,          
}

export function dxfEncText(pos: Vec3, rot: number, text: string, fontSize: number, col: DxfColor, handleRef: Handle): string {
  return `0
TEXT
5
${dxfHandleNext(handleRef)}
330
${DXF_MODEL_SPACE_HANDLE}
100
AcDbEntity
8
0
${dxfColor(col)}
100
AcDbText
10
${dxfRound(pos.x)}
20
${dxfRound(pos.y)}
30
${dxfRound(pos.z)}
40
${(fontSize * 0.75).toString()}
1
${text}
50
${dxfRound((rot / Math.PI) * 180.0)}
41
1.0
7
STANDARD
71
0
72
${DxfTextHorizontalAlignment.VCenter}
11
${dxfRound(pos.x)}
21
${dxfRound(pos.y)}
31
${dxfRound(pos.z)}
100
AcDbText
73
${DxfTextVerticalAlignment.Middle}
`;
}
