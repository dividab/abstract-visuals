import { type Dimension, dimensionIsOfTypeMesh, type Vec3, vec3Length, vec3Sub, vec3TransRot } from "../../../abstract-3d.js";
import type { Handle } from "../dxf-encoding/dxf-common.js";
import { type DxfDimensionDefinition, dxfEncDimension } from "../dxf-encoding/dxf-dimension.js";

export function dxfDimension(dimension: Dimension, parentPos: Vec3, parentRot: Vec3, sceneRotation: Vec3, viewRotation: Vec3, handleRef: Handle): DxfDimensionDefinition {
  if(dimensionIsOfTypeMesh(dimension)) {
    return {
      block: "",
      entity: "",
      blockRecord: "",
    };
  }
  const ms = vec3TransRot(dimension.measurementStart, parentPos, parentRot);
  const me = vec3TransRot(dimension.measurementEnd, parentPos, parentRot);
  const lp = vec3TransRot(dimension.linePosition, parentPos, parentRot);
  const text = dimension.text ?? `${vec3Length(vec3Sub(me, ms))}`;
  return dxfEncDimension(ms, me, lp, text, 7, sceneRotation, viewRotation, dimension.views ?? ["front"], handleRef);
}