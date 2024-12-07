import React from "react";
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

const svg = <AbstractImage.ReactSvg image={image} />;

export const testReactSvgPolygon: ExportTestDef = {
  name: "react svg polygon",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"key":null,"ref":null,"props":{"image":{"topLeft":{"x":0,"y":0},"size":{"width":400,"height":400},"backgroundColor":{"a":255,"r":255,"g":255,"b":255},"components":[{"type":"polygon","points":[{"x":110,"y":10},{"x":100,"y":20},{"x":110,"y":30},{"x":100,"y":40},{"x":110,"y":50}],"strokeColor":{"a":255,"r":0,"g":0,"b":255},"strokeThickness":2,"strokeDashStyle":{"dashes":[],"offset":0},"fillColor":{"a":255,"r":255,"g":0,"b":0}}]}},"_owner":null,"_store":{}}',
};
