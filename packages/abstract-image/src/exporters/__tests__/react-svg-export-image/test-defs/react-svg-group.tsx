import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

const components = [
  AbstractImage.createGroup("group", [
    AbstractImage.createText(
      AbstractImage.createPoint(200, 200),
      "Test",
      "Helvetica",
      12,
      AbstractImage.black,
      "normal",
      0,
      "center",
      "uniform",
      "uniform",
      0,
      AbstractImage.black,
      false
    ),
    AbstractImage.createRectangle(
      AbstractImage.createPoint(10, 50),
      AbstractImage.createPoint(50, 60),
      AbstractImage.blue,
      2,
      AbstractImage.red
    ),
  ]),
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const svg = AbstractImage.createReactSvg(image);

export const test: ExportTestDef = {
  name: "react svg group",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"type":"svg","key":null,"ref":null,"props":{"id":"ai_root","width":"400px","height":"400px","viewBox":"0 0 400 400","children":[{"type":"g","key":"0","ref":null,"props":{"name":"group","children":[{"type":"text","key":"0","ref":null,"props":{"style":{"textAnchor":"middle","fontSize":"12px","fontWeight":"normal","fontFamily":"Helvetica","fill":"rgb(0,0,0)"},"transform":"rotate(0 200 200)","children":[{"type":"tspan","key":"Test","ref":null,"props":{"x":200,"y":206,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Test"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}},{"type":"rect","key":"1","ref":null,"props":{"x":10,"y":50,"width":40,"height":10,"stroke":"rgb(0,0,255)","strokeWidth":2,"strokeOpacity":"1","fillOpacity":"1","fill":"rgb(255,0,0)"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
};
