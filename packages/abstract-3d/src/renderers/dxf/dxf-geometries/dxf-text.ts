import { type Text, type Material, type Vec3, vec3RotCombine, vec3TransRot, vec3Zero } from "../../../abstract-3d.js";
import type { Handle } from "../dxf-encoding/dxf-common.js";
import { dxfEncText } from "../dxf-encoding/dxf-text.js";

export function dxfText(t: Text, _m: Material, parentPos: Vec3, parentRot: Vec3, handleRef: Handle): string {
  const pos = vec3TransRot(t.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, t.rot ?? vec3Zero);
  return dxfEncText(pos, rot.z, t.text, t.fontSize, 7, handleRef);
}
