import type { Bounds3, Vec3 } from "../../../abstract-3d.js";
import type { DxfDimensionDefinition } from "./dxf-dimension.js";
import { dxfEncFooter } from "./dxf-footer.js";
import { dxfEncHeader } from "./dxf-header.js";

/** `textHeight` sets the dimension style's scale, so CAD programs that redraw a dimension from its entity draw its text at the height drawn */
export function dxfBuild(
  groups: string,
  dimensions: DxfDimensionDefinition,
  layers: string,
  textHeight: number | undefined,
  bounds: Bounds3,
  size: Vec3,
  center: Vec3
): string {
  const id = crypto.randomUUID();
  return (
    dxfEncHeader(bounds, center, id, size, layers, dimensions.block, dimensions.blockRecord, textHeight) +
    groups +
    dimensions.entity +
    dxfEncFooter(id)
  );
}
