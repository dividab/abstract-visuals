import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const components = [
  AbstractImage.createEllipse(
    AbstractImage.createPoint(50, 50),
    AbstractImage.createPoint(100, 100),
    AbstractImage.green,
    2,
    AbstractImage.yellow
  ),
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const svg = AbstractImage.createSVG(image);

export const testSvgEllpise: ExportTestDef = {
  name: "svg ellipse",
  abstractImage: svg,
  expectedImage:
    '<svg xmlns="http://www.w3.org/2000/svg" width="400px" height="400px" viewBox="0 0 400 400"><ellipse cx="75" cy="75" rx="25" ry="25" stroke="rgb(0, 128, 0)" stroke-opacity="1" stroke-width="2" fill="rgb(255, 255, 0)" fill-opacity="1"></ellipse></svg>',
};
