import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

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

export const test: ExportTestDef = {
  name: "react svg line",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"type":"svg","key":null,"ref":null,"props":{"id":"ai_root","width":"400px","height":"400px","viewBox":"0 0 400 400","children":[{"type":"line","key":"0","ref":null,"props":{"x1":10,"y1":100,"x2":40,"y2":70,"stroke":"rgb(0,0,0)","strokeWidth":2,"strokeOpacity":"1"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
};
