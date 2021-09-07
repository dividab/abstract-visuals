import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

const colorStrings = [
  "#000000",
  "#0000ff",
  "#a52a2a",
  "#00ffff",
  "#a9a9a9",
  "#808080",
  "#008000",
  "#d3d3d3",
  "#ff00ff",
  "#ffa500",
  "#800080",
  "#ff0000",
  "#ffffff",
  "#ffffff",
  "#ffff00",
  "#add8e6",
];

const fromColor = colorStrings.map((color) => AbstractImage.fromString(color));

export const test: ExportTestDef = {
  name: "color from string 6 digits",
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
