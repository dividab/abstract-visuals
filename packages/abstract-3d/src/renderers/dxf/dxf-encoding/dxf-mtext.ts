import type { Vec3 } from "../../../abstract-3d.js";
import { DXF_FONT_SIZE_RATIO, DXF_MODEL_SPACE_HANDLE, dxfHandleNext, dxfRound, type Handle } from "./dxf-common.js";

export enum DxfMTextAttachment {
  TopLeft = 1,
  TopCenter = 2,
  TopRight = 3,
  MiddleLeft = 4,
  MiddleCenter = 5,
  MiddleRight = 6,
  BottomLeft = 7,
  BottomCenter = 8,
  BottomRight = 9,
};

export function dxfEncMText(pos: Vec3, text: string, dir: Vec3, normal: Vec3, fontSize: number, handleRef: Handle, attachment: DxfMTextAttachment = DxfMTextAttachment.MiddleCenter, blockRefHandle?: string): string {
  return `0
MTEXT
5
${dxfHandleNext(handleRef)}
330
${blockRefHandle ?? DXF_MODEL_SPACE_HANDLE}
100
AcDbEntity
8
0
100
AcDbMText
10
${dxfRound(pos.x)}
20
${dxfRound(pos.y)}
30
${dxfRound(pos.z)}
40
${(fontSize * DXF_FONT_SIZE_RATIO).toString()}
71
${attachment}
11
${dxfRound(dir.x)}
21
${dxfRound(dir.y)}
31
${dxfRound(dir.z)}
210
${dxfRound(normal.x)}
220
${dxfRound(normal.y)}
230
${dxfRound(normal.z)}
1
${encodeDxfFormattedText(text)}
`;
}

export function encodeDxfFormattedText(text: string): string {
  return text.replace(/\r\n|\r|\n/g, "\\P");
}