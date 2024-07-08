import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

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

const svg = AbstractImage.createReactSvg(image);

export const test: ExportTestDef = {
  name: "react svg rectangle",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"type":"svg","key":null,"ref":null,"props":{"id":"ai_root","width":"400px","height":"400px","viewBox":"0 0 400 400","children":[{"key":"0","ref":null,"props":{"component":{"type":"rectangle","topLeft":{"x":10,"y":50},"bottomRight":{"x":50,"y":60},"strokeColor":{"a":255,"r":0,"g":0,"b":255},"strokeThickness":2,"strokeDashStyle":{"dashes":[],"offset":0},"fillColor":{"a":255,"r":255,"g":0,"b":0}}},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
};
