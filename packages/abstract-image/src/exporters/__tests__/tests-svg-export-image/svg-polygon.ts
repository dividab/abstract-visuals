import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const components = [
  AbstractImage.createPolygon(
    [
      AbstractImage.createPoint(110, 10),
      AbstractImage.createPoint(100, 20),
      AbstractImage.createPoint(110, 30),
      AbstractImage.createPoint(100, 40),
      AbstractImage.createPoint(110, 50),
    ],
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

export const testSvgPolygon: ExportTestDef = {
  name: "svg polygon",
  abstractImage: svg,
  expectedImage:
    '<svg xmlns="http://www.w3.org/2000/svg" width="400px" height="400px" viewBox="0 0 400 400"><polygon points="110,10 100,20 110,30 100,40 110,50" stroke="rgb(0, 0, 255)" stroke-opacity="1" stroke-width="2" fill="rgb(255, 0, 0)" fill-opacity="1"></polygon></svg>',
};
