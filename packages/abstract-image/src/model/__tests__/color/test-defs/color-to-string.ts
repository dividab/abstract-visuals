import { ExportTestDef } from "../export-test-def.js";
import * as AbstractImage from "../../../../../src/index.js";

const colors = [
  AbstractImage.black,
  AbstractImage.blue,
  AbstractImage.brown,
  AbstractImage.cyan,
  AbstractImage.darkGray,
  AbstractImage.gray,
  AbstractImage.green,
  AbstractImage.lightGray,
  AbstractImage.magenta,
  AbstractImage.orange,
  AbstractImage.purple,
  AbstractImage.red,
  AbstractImage.transparent,
  AbstractImage.white,
  AbstractImage.yellow,
  AbstractImage.lightBlue,
];

const colorString = colors
  .map((color) => AbstractImage.toString6Hex(color))
  .reduce((acc, color) => {
    acc += `${color} `;
    return acc;
  }, "")
  .slice(0, -1);

export const testColorToString: ExportTestDef = {
  name: "color to string",
  abstractColor: colorString,
  expectedColor: `000000 0000ff a52a2a 00ffff a9a9a9 808080 008000 d3d3d3 ff00ff ffa500 800080 ff0000 ffffff ffffff ffff00 add8e6`,
};
