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
    '{"type":"svg","key":null,"ref":null,"props":{"id":"ai_root","width":"400px","height":"400px","viewBox":"0 0 400 400","children":[{"type":"rect","key":"0","ref":null,"props":{"x":10,"y":50,"width":40,"height":10,"stroke":"rgb(0,0,255)","strokeWidth":2,"strokeOpacity":"1","fillOpacity":"1","fill":"rgb(255,0,0)"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
};
