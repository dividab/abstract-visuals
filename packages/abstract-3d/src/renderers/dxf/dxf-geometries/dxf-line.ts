import { type CulledLine, type Line, type Vec3, vec3TransRot } from "../../../abstract-3d.js";
import type { Handle } from "../dxf-encoding/dxf-common.js";
import { dxfEncLine } from "../dxf-encoding/dxf-line.js";

export const dxfLine = (l: Line | CulledLine, style: string, parentPos: Vec3, parentRot: Vec3, handleRef: Handle): string =>
  dxfEncLine(vec3TransRot(l.start, parentPos, parentRot), vec3TransRot(l.end, parentPos, parentRot), style, handleRef);
