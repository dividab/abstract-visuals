import { type Vec3, vec3 } from "../../../abstract-3d.js";
import type { DxfLayer, DxfLayerOptions } from "../dxf.js";
import { dxfHandleNext, type Handle } from "./dxf-common.js";

const DEFAULT_LAYER_TABLE: string = `0
TABLE
2
LAYER
5
2
330
0
100
AcDbSymbolTable
70
1
0
LAYER
5
10
330
2
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
2
0
70
0
62
7
6
CONTINUOUS
370
-3
390
F
0
ENDTAB`;

export type DxfDynamicColor = 7; // this color becomes white on a black background and black on a white background (therefore theme/dxf viewer dependent)
export type DxfColor = DxfDynamicColor | string;

export function dxfColor(color: DxfColor): string {
  return typeof color === "number"
    ? `62\n7`
    : `62
7
420
${dxfBitShiftColorFromStr(color)}`;
}

export function dxfEncLayerDefs(handleRef: Handle, options?: DxfLayerOptions): string {
  //if no options exist, return the default one
  if (!options) {
    return DEFAULT_LAYER_TABLE;
  }

  const layerHandleId = dxfHandleNext(handleRef);

  const layers: Record<string, DxfLayer> = {
    ...options.layers,
    "0": options.baseLayer,
  };
  const layerCount = Object.keys(layers).length.toString();

  let table = "";
  table += "0\nTABLE\n";
  table += "2\nLAYER\n";
  table += "5\n" + layerHandleId + "\n";
  table += "330\n0\n";
  table += "100\nAcDbSymbolTable\n";
  table += "70\n" + layerCount + "\n";

  for (const [name, layer] of Object.entries(layers).toSorted((a, b) => a[0].localeCompare(b[0]))) {
    table += "0\nLAYER\n";
    table += "5\n" + dxfHandleNext(handleRef) + "\n";
    table += "330\n" + layerHandleId + "\n";
    table += "100\nAcDbSymbolTableRecord\n";
    table += "100\nAcDbLayerTableRecord\n";
    table += "2\n" + name + "\n";
    table += "70\n0\n";
    table += "62\n7\n";
    table += `420\n${dxfBitShiftColor(layer.color.r, layer.color.g, layer.color.b)}\n`;
    table += "6\nCONTINUOUS\n";
    table += "370\n-3\n";
    table += "390\nF\n";
  }

  table += "0\nENDTAB";
  return table;
}

function colorNormalToVec3Color(colorNormal: string): Vec3 {
  const errorColor = vec3(255, 0, 255); // #ff00ff, magenta
  const paranthesisRegex = /(?<=\().+?(?=\))/;
  const inside = paranthesisRegex.exec(colorNormal);
  if (inside === null || inside.length < 1) {
    return errorColor;
  }
  const values = inside[0].replaceAll(" ", "").split(",");
  if (values.length < 3) {
    return errorColor;
  }
  const r = parseInt(values[0] ?? "", 10);
  const g = parseInt(values[1] ?? "", 10);
  const b = parseInt(values[2] ?? "", 10);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return errorColor;
  }
  return vec3(r % 256, g % 256, b % 256);
}

function dxfBitShiftColorFromStr(color: string): number {
  const oc = colorNormalToVec3Color(color);
  return dxfBitShiftColor(oc.x, oc.y, oc.z);
}

function dxfBitShiftColor(r: number, g: number, b: number): number {
  // oxlint-disable-next-line no-bitwise
  const colorAsInt = (r << 16) + (g << 8) + b;
  if (Number.isNaN(colorAsInt)) {
    return 0;
  }
  return colorAsInt;
}
