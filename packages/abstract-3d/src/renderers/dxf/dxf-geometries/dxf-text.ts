import { type Text, type Vec3, vec3, vec3Dot, vec3Rot, vec3RotCombine, vec3TransRot, vec3Zero } from "../../../abstract-3d.js";
import type { Handle } from "../dxf-encoding/dxf-common.js";
import { DxfMTextAttachment, dxfEncMText } from "../dxf-encoding/dxf-mtext.js";

/** As the svg renderer leaves it out, text facing away from the view, which would be mirrored */
const FACING_AWAY = -0.9;

/** Centered on its position, in its own plane, the scene's text height if it has no font size */
export function dxfText(t: Text, style: string, textHeight: number, parentPos: Vec3, parentRot: Vec3, handleRef: Handle): string {
  const pos = vec3TransRot(t.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, t.rot ?? vec3Zero);
  const normal = vec3Rot(vec3(0, 0, 1), vec3Zero, rot);
  if (vec3Dot(normal, vec3(0, 0, 1)) <= FACING_AWAY) {
    return "";
  }
  const dir = vec3Rot(vec3(1, 0, 0), vec3Zero, rot);
  return dxfEncMText(pos, t.text, dir, normal, t.fontSize ?? textHeight, style, handleRef, DxfMTextAttachment.MiddleCenter);
}
