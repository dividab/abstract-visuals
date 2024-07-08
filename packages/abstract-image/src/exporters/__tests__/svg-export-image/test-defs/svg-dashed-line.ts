import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

const components = [
  AbstractImage.createLine(
    AbstractImage.createPoint(10, 100),
    AbstractImage.createPoint(40, 70),
    AbstractImage.black,
    2,
    undefined,
    AbstractImage.createDashStyle([10, 5], 3)
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
  name: "svg dashed line",
  abstractImage: svg,
  expectedImage:
    '<svg xmlns="http://www.w3.org/2000/svg" width="400px" height="400px" viewBox="0 0 400 400"><line x1="10" y1="100" x2="40" y2="70" stroke="rgb(0, 0, 0)" stroke-opacity="1" stroke-width="2" stroke-dasharray="10 5" stroke-dashoffset="3"></line></svg>',
};
