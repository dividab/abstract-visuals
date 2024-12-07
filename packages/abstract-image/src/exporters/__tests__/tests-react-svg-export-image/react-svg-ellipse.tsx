import * as React from "react";
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

const svg = <AbstractImage.ReactSvg image={image} />;

export const testReactSvgEllipse: ExportTestDef = {
  name: "react svg ellipse",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"key":null,"props":{"image":{"topLeft":{"x":0,"y":0},"size":{"width":400,"height":400},"backgroundColor":{"a":255,"r":255,"g":255,"b":255},"components":[{"type":"ellipse","topLeft":{"x":50,"y":50},"bottomRight":{"x":100,"y":100},"strokeColor":{"a":255,"r":0,"g":128,"b":0},"strokeThickness":2,"strokeDashStyle":{"dashes":[],"offset":0},"fillColor":{"a":255,"r":255,"g":255,"b":0}}]}},"_owner":null,"_store":{}}',
};
