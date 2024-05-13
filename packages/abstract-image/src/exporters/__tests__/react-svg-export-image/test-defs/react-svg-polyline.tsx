import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

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

const svg = AbstractImage.createReactSvg(image);

export const test: ExportTestDef = {
  name: "react svg polyline",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"type":"svg","key":null,"ref":null,"props":{"id":"ai_root","width":"400px","height":"400px","viewBox":"0 0 400 400","children":[{"key":"0","ref":null,"props":{"component":{"type":"polyline","points":[{"x":10,"y":40},{"x":20,"y":30},{"x":30,"y":40},{"x":40,"y":30},{"x":50,"y":40},{"x":60,"y":30},{"x":70,"y":40}],"strokeColor":{"a":255,"r":0,"g":0,"b":0},"strokeThickness":2}},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
};
