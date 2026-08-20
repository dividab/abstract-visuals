import type { Vec3 } from "../../../abstract-3d.js";
import { type DxfColor, dxfColor } from "./dxf-color.js";
import { DXF_MODEL_SPACE_HANDLE, dxfHandleNext, dxfRound, type Handle } from "./dxf-common.js";

export function dxfEncPolyline(
  points: ReadonlyArray<Vec3>,
  col: DxfColor,
  closed: boolean,
  handleRef: Handle,
  blockRefHandle?: string
): string {
  if (points.length < 2) {
    return "";
  }

  const polylineHandle = dxfHandleNext(handleRef);
  const seqEndHandle = dxfHandleNext(handleRef);
  const vertices = points
    .map((p) => {
  return `  0
VERTEX
5
${dxfHandleNext(handleRef)}
330
${polylineHandle}
100
AcDbEntity
8
0
${dxfColor(col)}
100
AcDbVertex
100
AcDb3dPolylineVertex
10
${dxfRound(p.x)}
20
${dxfRound(p.y)}
30
${dxfRound(p.z)}
70
32`;
    })
    .join("\n");
  

  return `  0
POLYLINE
5
${polylineHandle}
330
${blockRefHandle ?? DXF_MODEL_SPACE_HANDLE}
100
AcDbEntity
8
0
${dxfColor(col)}
100
AcDb3dPolyline
66
1
10
0.0
20
0.0
30
0.0
70
${closed ? 9 : 8}
${vertices}
  0
SEQEND
5
${seqEndHandle}
330
${polylineHandle}
100
AcDbEntity
8
0
`;
}