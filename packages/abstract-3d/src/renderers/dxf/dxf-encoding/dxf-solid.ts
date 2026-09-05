import type { Vec3 } from "../../../abstract-3d.js";
import { type DxfColor, dxfColor } from "./dxf-color.js";
import { DXF_MODEL_SPACE_HANDLE, dxfHandleNext, dxfRound, type Handle } from "./dxf-common.js";

export const dxfEncSolid = (
  vec1: Vec3,
  vec2: Vec3,
  vec3: Vec3,
  vec4: Vec3,
  col: DxfColor,
  handleRef: Handle,
  blockRefHandle?: string
): string => `  0
SOLID
5
${dxfHandleNext(handleRef)}
330
${blockRefHandle ?? DXF_MODEL_SPACE_HANDLE}
100
AcDbEntity
${dxfColor(col)}
100
AcDbTrace
10
${dxfRound(vec1.x)}
20
${dxfRound(vec1.y)}
30
${dxfRound(vec1.z)}
11
${dxfRound(vec2.x)}
21
${dxfRound(vec2.y)}
31
${dxfRound(vec2.z)}
12
${dxfRound(vec3.x)}
22
${dxfRound(vec3.y)}
32
${dxfRound(vec3.z)}
13
${dxfRound(vec4.x)}
23
${dxfRound(vec4.y)}
33
${dxfRound(vec4.z)}
`;
