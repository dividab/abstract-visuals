import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

const components = [
  AbstractImage.createGroup("group", [
    AbstractImage.createText(
      AbstractImage.createPoint(200, 200),
      "Test",
      "Helvetica",
      12,
      AbstractImage.black,
      "normal",
      0,
      "center",
      "uniform",
      "uniform",
      0,
      AbstractImage.black,
      false
    ),
    AbstractImage.createRectangle(
      AbstractImage.createPoint(10, 50),
      AbstractImage.createPoint(50, 60),
      AbstractImage.blue,
      2,
      AbstractImage.red
    ),
  ]),
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const svg = AbstractImage.createSVG(image);

export const test: ExportTestDef = {
  name: "svg group",
  abstractImage: svg,
  expectedImage:
    '<svg xmlns="http://www.w3.org/2000/svg" width="400px" height="400px" viewBox="0 0 400 400"><g name="group"><text style="text-anchor:middle;font-size:12px;font-weight:normal;font-family:Helvetica;fill:rgb(0, 0, 0);fill-opacity:1;" transform="rotate(0 200 200)"><tspan x="200" y="200" height="12px"><tspan alignment-baseline="central">Test</tspan></tspan></text><rect x="10" y="50" width="40" height="10" stroke="rgb(0, 0, 255)" stroke-opacity="1" stroke-width="2" fill="rgb(255, 0, 0)" fill-opacity="1"></rect></g></svg>',
};
