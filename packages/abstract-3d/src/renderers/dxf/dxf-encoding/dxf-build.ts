import { generateUUID } from "three/src/math/MathUtils.js";
import type { Bounds3, Vec3 } from "../../../abstract-3d.js";
import type { DxfDimensionDefinition } from "./dxf-dimension.js";
import { dxfEncFooter } from "./dxf-footer.js";
import { dxfEncHeader } from "./dxf-header.js";

export function dxfBuild(groups: string, dimensions: DxfDimensionDefinition, bounds: Bounds3, size: Vec3, center: Vec3): string {
  const id = generateUUID();
  return dxfEncHeader(bounds, center, id, size, dimensions.block, dimensions.blockRecord) + groups + dimensions.entity + dxfEncFooter(id);
}
