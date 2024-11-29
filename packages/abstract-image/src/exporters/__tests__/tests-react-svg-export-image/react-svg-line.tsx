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

const svg = AbstractImage.createReactSvg(image);

export const testReactSvgLine: ExportTestDef = {
  name: "react svg line",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"type":"svg","key":null,"ref":null,"props":{"id":"ai_root","width":"400px","height":"400px","viewBox":"0 0 400 400","children":[{"key":"0","ref":null,"props":{"component":{"type":"line","start":{"x":10,"y":100},"end":{"x":40,"y":70},"strokeColor":{"a":255,"r":0,"g":0,"b":0},"strokeThickness":2,"strokeDashStyle":{"dashes":[],"offset":0}}},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
};
