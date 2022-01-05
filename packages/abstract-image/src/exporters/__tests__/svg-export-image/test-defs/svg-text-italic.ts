import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

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

export const test: ExportTestDef = {
  name: "svg text italic",
  abstractImage: svg,
  expectedImage:
    '<svg xmlns="http://www.w3.org/2000/svg" width="400px" height="400px" viewBox="0 0 400 400"><text style="text-anchor:start;font-size:12px;font-weight:normal;font-family:Arial;stroke:rgb(255, 0, 0);stroke-opacity:1;stroke-width:2px;" transform="rotate(0 10 10)"><tspan x="10" y="22" height="12px">Hello World</tspan></text>,<text style="text-anchor:start;font-size:12px;font-weight:normal;font-family:Arial;fill:rgb(0, 0, 0);fill-opacity:1;" transform="rotate(0 10 10)"><tspan x="10" y="22" height="12px">Hello World</tspan></text><text style="text-anchor:start;font-size:12px;font-weight:bold;font-family:Arial;stroke:rgb(255, 0, 0);stroke-opacity:1;stroke-width:2px;" transform="rotate(0 20 20)"><tspan x="20" y="32" height="12px">Hello World</tspan></text>,<text style="text-anchor:start;font-size:12px;font-weight:bold;font-family:Arial;fill:rgb(0, 0, 0);fill-opacity:1;" transform="rotate(0 20 20)"><tspan x="20" y="32" height="12px">Hello World</tspan></text><text style="text-anchor:start;font-size:12px;font-weight:mediumBold;font-family:Arial;stroke:rgb(255, 0, 0);stroke-opacity:1;stroke-width:2px;" transform="rotate(0 30 30)"><tspan x="30" y="42" height="12px">Hello World</tspan></text>,<text style="text-anchor:start;font-size:12px;font-weight:mediumBold;font-family:Arial;fill:rgb(0, 0, 0);fill-opacity:1;" transform="rotate(0 30 30)"><tspan x="30" y="42" height="12px">Hello World</tspan></text></svg>',
};
