import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const components = [
  AbstractImage.createLine(
    AbstractImage.createPoint(10, 100),
    AbstractImage.createPoint(40, 70),
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

export const testReactSvgLine: ExportTestDef = {
  name: "react svg line",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"key":null,"ref":null,"props":{"image":{"topLeft":{"x":0,"y":0},"size":{"width":400,"height":400},"backgroundColor":{"a":255,"r":255,"g":255,"b":255},"components":[{"type":"line","start":{"x":10,"y":100},"end":{"x":40,"y":70},"strokeColor":{"a":255,"r":0,"g":0,"b":0},"strokeThickness":2,"strokeDashStyle":{"dashes":[],"offset":0}}]}},"_owner":null,"_store":{}}',
};
