import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

const components = [
  AbstractImage.createText(
    AbstractImage.createPoint(10, 10),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "bold",
    0,
    "center",
    "left",
    "up",
    2,
    AbstractImage.red,
    false
  ),
  AbstractImage.createText(
    AbstractImage.createPoint(10, 30),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "bold",
    0,
    "center",
    "uniform",
    "uniform",
    2,
    AbstractImage.red,
    false
  ),
  AbstractImage.createText(
    AbstractImage.createPoint(10, 50),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "bold",
    0,
    "left",
    "right",
    "down",
    2,
    AbstractImage.red,
    false
  ),
  AbstractImage.createText(
    AbstractImage.createPoint(10, 70),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "bold",
    0,
    "right",
    "right",
    "down",
    2,
    AbstractImage.red,
    false
  ),
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const svg = AbstractImage.createSVG(image);

export const test: ExportTestDef = {
  name: "svg text growth directions",
  abstractImage: svg,
  expectedImage:
    '<svg xmlns="http://www.w3.org/2000/svg" width="400px" height="400px" viewBox="0 0 400 400"><text style="text-anchor:end;font-size:12px;font-weight:bold;font-family:Arial;stroke:rgb(255, 0, 0);stroke-opacity:1;stroke-width:2px;" transform="rotate(0 10 10)"><tspan x="10" y="10" height="12px"><tspan alignment-baseline="baseline">Hello World</tspan></tspan></text>,<text style="text-anchor:end;font-size:12px;font-weight:bold;font-family:Arial;fill:rgb(0, 0, 0);fill-opacity:1;" transform="rotate(0 10 10)"><tspan x="10" y="10" height="12px"><tspan alignment-baseline="baseline">Hello World</tspan></tspan></text><text style="text-anchor:middle;font-size:12px;font-weight:bold;font-family:Arial;stroke:rgb(255, 0, 0);stroke-opacity:1;stroke-width:2px;" transform="rotate(0 10 30)"><tspan x="10" y="30" height="12px"><tspan alignment-baseline="central">Hello World</tspan></tspan></text>,<text style="text-anchor:middle;font-size:12px;font-weight:bold;font-family:Arial;fill:rgb(0, 0, 0);fill-opacity:1;" transform="rotate(0 10 30)"><tspan x="10" y="30" height="12px"><tspan alignment-baseline="central">Hello World</tspan></tspan></text><text style="text-anchor:start;font-size:12px;font-weight:bold;font-family:Arial;stroke:rgb(255, 0, 0);stroke-opacity:1;stroke-width:2px;" transform="rotate(0 10 50)"><tspan x="10" y="50" height="12px"><tspan alignment-baseline="hanging">Hello World</tspan></tspan></text>,<text style="text-anchor:start;font-size:12px;font-weight:bold;font-family:Arial;fill:rgb(0, 0, 0);fill-opacity:1;" transform="rotate(0 10 50)"><tspan x="10" y="50" height="12px"><tspan alignment-baseline="hanging">Hello World</tspan></tspan></text><text style="text-anchor:start;font-size:12px;font-weight:bold;font-family:Arial;stroke:rgb(255, 0, 0);stroke-opacity:1;stroke-width:2px;" transform="rotate(0 10 70)"><tspan x="10" y="70" height="12px"><tspan alignment-baseline="hanging">Hello World</tspan></tspan></text>,<text style="text-anchor:start;font-size:12px;font-weight:bold;font-family:Arial;fill:rgb(0, 0, 0);fill-opacity:1;" transform="rotate(0 10 70)"><tspan x="10" y="70" height="12px"><tspan alignment-baseline="hanging">Hello World</tspan></tspan></text></svg>',
};
