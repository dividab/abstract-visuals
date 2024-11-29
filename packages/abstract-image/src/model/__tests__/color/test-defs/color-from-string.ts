import { ExportTestDef } from "../export-test-def.js";
import * as AbstractImage from "../../../../../src/index.js";

const colorStrings = [
  "#ff000000",
  "#ff0000ff",
  "#ffa52a2a",
  "#ff00ffff",
  "#ffa9a9a9",
  "#ff808080",
  "#ff008000",
  "#ffd3d3d3",
  "#ffff00ff",
  "#ffffa500",
  "#ff800080",
  "#ffff0000",
  "#ffffffff",
  "#ffffffff",
  "#ffffff00",
  "#ffadd8e6",
];

const fromColor = colorStrings.map((color) => AbstractImage.fromString(color));

export const testColorFromString: ExportTestDef = {
  name: "color from string",
  abstractColor: fromColor,
  expectedColor: [
    { a: 255, b: 0, g: 0, r: 0 },
    { a: 255, b: 255, g: 0, r: 0 },
    { a: 255, b: 42, g: 42, r: 165 },
    { a: 255, b: 255, g: 255, r: 0 },
    { a: 255, b: 169, g: 169, r: 169 },
    { a: 255, b: 128, g: 128, r: 128 },
    { a: 255, b: 0, g: 128, r: 0 },
    { a: 255, b: 211, g: 211, r: 211 },
    { a: 255, b: 255, g: 0, r: 255 },
    { a: 255, b: 0, g: 165, r: 255 },
    { a: 255, b: 128, g: 0, r: 128 },
    { a: 255, b: 0, g: 0, r: 255 },
    { a: 255, b: 255, g: 255, r: 255 },
    { a: 255, b: 255, g: 255, r: 255 },
    { a: 255, b: 0, g: 255, r: 255 },
    { a: 255, b: 230, g: 216, r: 173 },
  ],
};
