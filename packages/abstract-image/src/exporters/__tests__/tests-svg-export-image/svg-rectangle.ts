import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const components = [
  AbstractImage.createRectangle(
    AbstractImage.createPoint(10, 50),
    AbstractImage.createPoint(50, 60),
    AbstractImage.blue,
    2,
    AbstractImage.red
  ),
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const svg = AbstractImage.createSVG(image);

export const testSvgRectangle: ExportTestDef = {
  name: "svg rectangle",
  abstractImage: svg,
  expectedImage:
    '<svg xmlns="http://www.w3.org/2000/svg" width="400px" height="400px" viewBox="0 0 400 400"><rect x="10" y="50" width="40" height="10" stroke="rgb(0, 0, 255)" stroke-opacity="1" stroke-width="2" fill="rgb(255, 0, 0)" fill-opacity="1"></rect></svg>',
};
