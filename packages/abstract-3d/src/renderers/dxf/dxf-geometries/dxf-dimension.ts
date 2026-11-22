import {
  type Dimension,
  type DimensionPlacement,
  dimensionIsOfTypeMesh,
  type Vec3,
  vec3Length,
  vec3Sub,
  vec3TransRot,
} from "../../../abstract-3d.js";
import type { Handle } from "../dxf-encoding/dxf-common.js";
import { type DxfDimensionDefinition, dxfEncDimension } from "../dxf-encoding/dxf-dimension.js";

export function dxfDimension(
  dimension: Dimension,
  parentPos: Vec3,
  parentRot: Vec3,
  viewRotation: Vec3,
  textHeight: number | undefined,
  style: string,
  placement: DimensionPlacement | undefined,
  handleRef: Handle
): DxfDimensionDefinition {
  if (dimensionIsOfTypeMesh(dimension)) {
    return {
      block: "",
      entity: "",
      blockRecord: "",
    };
  }
  const tr = (v: Vec3): Vec3 => vec3TransRot(v, parentPos, parentRot);
  const ms = tr(dimension.measurementStart);
  const me = tr(dimension.measurementEnd);
  // The placement is in the scene's coordinates, as the measured points before they're moved into the DXF's
  const place = placement && {
    ...placement,
    linePosition: tr(placement.linePosition),
    endLines: placement.endLines.map(([start, end]) => [tr(start), tr(end)] as const),
  };
  const lp = place?.linePosition ?? tr(dimension.linePosition);
  const text = dimension.text ?? `${vec3Length(vec3Sub(me, ms))}`;
  return dxfEncDimension(ms, me, lp, text, style, viewRotation, dimension.views ?? ["front"], textHeight, place, handleRef);
}
