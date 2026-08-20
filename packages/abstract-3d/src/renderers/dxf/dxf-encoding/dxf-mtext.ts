import type { Vec3 } from "../../../abstract-3d.js";
import { DXF_MODEL_SPACE_HANDLE, dxfHandleNext, dxfRound, type Handle } from "./dxf-common.js";

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

export function dxfEncMText(pos: Vec3, text: string, rotation: number, fontSize: number, handleRef: Handle, attachment: DxfMTextAttachment = DxfMTextAttachment.MiddleCenter, blockRefHandle?: string): string {
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
${(fontSize * 0.75).toString()}
71
${attachment}
50
${dxfRound((rotation / Math.PI) * 180.0)}
1
${text}
`;
}