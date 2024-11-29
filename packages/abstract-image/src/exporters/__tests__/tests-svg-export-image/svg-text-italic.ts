import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const components = [
  AbstractImage.createText(
    AbstractImage.createPoint(10, 10),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "normal",
    0,
    "center",
    "right",
    "down",
    2,
    AbstractImage.red,
    true
  ),
  AbstractImage.createText(
    AbstractImage.createPoint(20, 20),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "bold",
    0,
    "center",
    "right",
    "down",
    2,
    AbstractImage.red,
    true
  ),
  AbstractImage.createText(
    AbstractImage.createPoint(30, 30),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "mediumBold",
    0,
    "center",
    "right",
    "down",
    2,
    AbstractImage.red,
    true
  ),
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const svg = AbstractImage.createSVG(image);

export const testSvgTextItalic: ExportTestDef = {
  name: "svg text italic",
  abstractImage: svg,
  expectedImage:
    '<svg xmlns="http://www.w3.org/2000/svg" width="400px" height="400px" viewBox="0 0 400 400"><text style="text-anchor:start;font-size:12px;font-weight:normal;font-family:Arial;stroke:rgb(255, 0, 0);stroke-opacity:1;stroke-width:2px;" transform="rotate(0 10 10)"><tspan x="10" y="10" height="12px"><tspan alignment-baseline="hanging">Hello World</tspan></tspan></text>,<text style="text-anchor:start;font-size:12px;font-weight:normal;font-family:Arial;fill:rgb(0, 0, 0);fill-opacity:1;" transform="rotate(0 10 10)"><tspan x="10" y="10" height="12px"><tspan alignment-baseline="hanging">Hello World</tspan></tspan></text><text style="text-anchor:start;font-size:12px;font-weight:bold;font-family:Arial;stroke:rgb(255, 0, 0);stroke-opacity:1;stroke-width:2px;" transform="rotate(0 20 20)"><tspan x="20" y="20" height="12px"><tspan alignment-baseline="hanging">Hello World</tspan></tspan></text>,<text style="text-anchor:start;font-size:12px;font-weight:bold;font-family:Arial;fill:rgb(0, 0, 0);fill-opacity:1;" transform="rotate(0 20 20)"><tspan x="20" y="20" height="12px"><tspan alignment-baseline="hanging">Hello World</tspan></tspan></text><text style="text-anchor:start;font-size:12px;font-weight:mediumBold;font-family:Arial;stroke:rgb(255, 0, 0);stroke-opacity:1;stroke-width:2px;" transform="rotate(0 30 30)"><tspan x="30" y="30" height="12px"><tspan alignment-baseline="hanging">Hello World</tspan></tspan></text>,<text style="text-anchor:start;font-size:12px;font-weight:mediumBold;font-family:Arial;fill:rgb(0, 0, 0);fill-opacity:1;" transform="rotate(0 30 30)"><tspan x="30" y="30" height="12px"><tspan alignment-baseline="hanging">Hello World</tspan></tspan></text></svg>',
};
