import type { Vec3 } from "../../../abstract-3d.js";
import { type DxfColor, dxfColor } from "./dxf-color.js";
import { DXF_MODEL_SPACE_HANDLE, dxfHandleNext, dxfRound, type Handle } from "./dxf-common.js";

export type DxfDimensionDefinition = {
  readonly entity: string;
  readonly block: string;
};

export function dxfEncDimension(
  measurementStart: Vec3,
  measurementEnd: Vec3,
  linePosition: Vec3,
  text: string,
  col: DxfColor,
  handleRef: Handle
): DxfDimensionDefinition {
  const blockName = `*Dimension${dxfHandleNext(handleRef)}`;
  return {
    entity: dxfEncodeDimensionEntity(blockName, measurementStart, measurementEnd, linePosition, text, col, handleRef),
    block: dxfEncodeDimensionBlock(blockName, measurementStart, measurementEnd, linePosition, text, col, handleRef),
  };
}

function dxfEncodeDimensionEntity(
  blockName: string,
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
2
${blockName}
10
${dxfRound(measurementEnd.x)}
20
${dxfRound(linePosition.y)}
30
${dxfRound(linePosition.z)}
11
${dxfRound(linePosition.x)}
21
${dxfRound(linePosition.y)}
31
${dxfRound(linePosition.z)}
70
33
1
${encodeDxfFormattedText(text)}
71
5
72
0
3
Standard
53
0
210
0
220
0
230
1
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

function dxfEncodeDimensionBlock(
  blockName: string,
  measurementStart: Vec3,
  measurementEnd: Vec3,
  linePosition: Vec3,
  text: string,
  col: DxfColor,
  handleRef: Handle
): string {
  return "";
}

export function encodeDxfFormattedText(text: string): string {
  return text.replace(/\r\n|\r|\n/g, "\\P");
}