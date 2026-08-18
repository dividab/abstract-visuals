import type { Vec3 } from "../../../abstract-3d.js";
import { type DxfColor, dxfColor } from "./dxf-color.js";
import { DXF_MODEL_SPACE_HANDLE, dxfHandleNext, dxfRound, type Handle } from "./dxf-common.js";

export function dxfEncDimension(
  measurementStart: Vec3,
  measurementEnd: Vec3,
  linePosition: Vec3,
  text: string,
  col: DxfColor,
  handleRef: Handle
): string {

  return `0
DIMENSION
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
AcDbDimension
280
0
10
${dxfRound(linePosition.x)}
20
${dxfRound(linePosition.y)}
30
${dxfRound(linePosition.z)}
70
33
1
${encodeDxfFormattedText(text)}
3
Standard
100
AcDbAlignedDimension
13
${dxfRound(measurementStart.x)}
23
${dxfRound(measurementStart.y)}
33
${dxfRound(measurementStart.z)}
14
${dxfRound(measurementEnd.x)}
24
${dxfRound(measurementEnd.y)}
34
${dxfRound(measurementEnd.z)}
`;
}

export function encodeDxfFormattedText(text: string): string {
  return text.replace(/\r\n|\r|\n/g, "\\P");
}