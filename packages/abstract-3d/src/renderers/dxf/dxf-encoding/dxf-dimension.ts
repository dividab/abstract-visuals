import { dimensionMeshifyAlignedDimension, type Material, vec3Zero, type Vec3 } from "../../../abstract-3d.js";
import { type DxfColor, dxfColor } from "./dxf-color.js";
import { DXF_BLOCK_RECORD_HANDLE, DXF_MODEL_SPACE_HANDLE, dxfHandleNext, dxfRound, type Handle } from "./dxf-common.js";
import { dxfEncLine } from "./dxf-line.js";
import { DxfMTextAttachment, dxfEncMText } from "./dxf-mtext.js";
import { dxfEncSolidTriangle } from "./dxf-triangle.js";

export type DxfDimensionDefinition = {
  readonly entity: string;
  readonly block: string;
  readonly blockRecord: string;
};

export function dxfEncDimension(
  measurementStart: Vec3,
  measurementEnd: Vec3,
  linePosition: Vec3,
  text: string,
  col: DxfColor,
  handleRef: Handle
): DxfDimensionDefinition {
  const blockRecordHandle = dxfHandleNext(handleRef);
  const blockName = `*D${blockRecordHandle}`;
  return {
    entity: dxfEncodeDimensionEntity(blockName, measurementStart, measurementEnd, linePosition, text, col, handleRef),
    block: dxfEncodeDimensionBlock(blockName, blockRecordHandle, measurementStart, measurementEnd, linePosition, text, col, handleRef),
    blockRecord: dxfEncodeDimensionBlockRecord(blockName, blockRecordHandle)
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

function dxfEncodeDimensionBlockRecord(
  blockName: string,
  blockRecordHandle: string,
): string {
  return `0
BLOCK_RECORD
5
${blockRecordHandle}
330
${DXF_BLOCK_RECORD_HANDLE}
100
AcDbSymbolTableRecord
100
AcDbBlockTableRecord
2
${blockName}
`;
}

function dxfEncodeDimensionBlock(
  blockName: string,
  blockRecordHandle: string,
  measurementStart: Vec3,
  measurementEnd: Vec3,
  linePosition: Vec3,
  text: string,
  col: DxfColor,
  handleRef: Handle
): string {
  return `0
BLOCK
5
${dxfHandleNext(handleRef)}
330
${blockRecordHandle}
100
AcDbEntity
8
0
100
AcDbBlockBegin
2
${blockName}
70
1
10
0.0
20
0.0
30
0.0
3
${blockName}
1

${dxfEncodeDimensionGeometry(blockRecordHandle, measurementStart, measurementEnd, linePosition, text, col, handleRef)}0
ENDBLK
5
${dxfHandleNext(handleRef)}
330
${blockRecordHandle}
100
AcDbEntity
67
1
8
0
100
AcDbBlockEnd
`;
}

function dxfEncodeDimensionGeometry(
  blockRecordHandle: string,
  measurementStart: Vec3,
  measurementEnd: Vec3,
  linePosition: Vec3,
  text: string,
  col: DxfColor,
  handleRef: Handle
): string {
  let entities = "";

  const onCreateLine = (start: Vec3, end: Vec3, _norm: Vec3, _thickness: number, _mat: Material): void => {
    entities += dxfEncLine(start, end, col, handleRef, blockRecordHandle);
  };
  const onCreateText = (pos: Vec3, measurement: string, fontSize: number, _mat: Material, rot: Vec3): void => {
    entities += dxfEncMText(pos, measurement, rot.z, fontSize, handleRef, DxfMTextAttachment.MiddleCenter, blockRecordHandle);
  };
  const onCreatePolygon = (p1: Vec3, p2: Vec3, p3: Vec3, _mat: Material): void => {
    entities += dxfEncSolidTriangle(p1, p2, p3, col, handleRef, blockRecordHandle);
  };

  dimensionMeshifyAlignedDimension({linePosition, measurementEnd, measurementStart, text}, vec3Zero, onCreateLine, onCreateText, onCreatePolygon);
  return entities;
}

export function encodeDxfFormattedText(text: string): string {
  return text.replace(/\r\n|\r|\n/g, "\\P");
}