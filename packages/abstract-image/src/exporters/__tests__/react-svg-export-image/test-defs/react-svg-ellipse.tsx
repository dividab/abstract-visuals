import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";
import * as React from "react";

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

const svg = AbstractImage.createReactSvg(image);

export const test: ExportTestDef = {
  name: "react svg ellipse",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"type":"svg","key":null,"ref":null,"props":{"id":"ai_root","width":"400px","height":"400px","viewBox":"0 0 400 400","children":[{"key":"0","ref":null,"props":{"component":{"type":"ellipse","topLeft":{"x":50,"y":50},"bottomRight":{"x":100,"y":100},"strokeColor":{"a":255,"r":0,"g":128,"b":0},"strokeThickness":2,"strokeDashStyle":{"dashes":[],"offset":0},"fillColor":{"a":255,"r":255,"g":255,"b":0}}},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
};
