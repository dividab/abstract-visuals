import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const components = [
  AbstractImage.createPolyLine(
    [
      AbstractImage.createPoint(10, 40),
      AbstractImage.createPoint(20, 30),
      AbstractImage.createPoint(30, 40),
      AbstractImage.createPoint(40, 30),
      AbstractImage.createPoint(50, 40),
      AbstractImage.createPoint(60, 30),
      AbstractImage.createPoint(70, 40),
    ],
    AbstractImage.black,
    2
  ),
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const svg = AbstractImage.createSVG(image);

export const testSvgPolyline: ExportTestDef = {
  name: "svg polyline",
  abstractImage: svg,
  expectedImage:
    '<svg xmlns="http://www.w3.org/2000/svg" width="400px" height="400px" viewBox="0 0 400 400"><polyline fill="none" points="10,40 20,30 30,40 40,30 50,40 60,30 70,40" stroke="rgb(0, 0, 0)" stroke-opacity="1" stroke-width="2"></polyline></svg>',
};
