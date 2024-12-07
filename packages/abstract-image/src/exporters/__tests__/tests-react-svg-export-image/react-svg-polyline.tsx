import React from "react";
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

const svg = <AbstractImage.ReactSvg image={image} />;

export const testReactSvgPolyline: ExportTestDef = {
  name: "react svg polyline",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"key":null,"ref":null,"props":{"image":{"topLeft":{"x":0,"y":0},"size":{"width":400,"height":400},"backgroundColor":{"a":255,"r":255,"g":255,"b":255},"components":[{"type":"polyline","points":[{"x":10,"y":40},{"x":20,"y":30},{"x":30,"y":40},{"x":40,"y":30},{"x":50,"y":40},{"x":60,"y":30},{"x":70,"y":40}],"strokeColor":{"a":255,"r":0,"g":0,"b":0},"strokeThickness":2,"strokeDashStyle":{"dashes":[],"offset":0}}]}},"_owner":null,"_store":{}}',
};
