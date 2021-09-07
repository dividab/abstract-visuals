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
    '{"type":"svg","key":null,"ref":null,"props":{"id":"ai_root","width":"400px","height":"400px","viewBox":"0 0 400 400","children":[{"type":"polyline","key":"0","ref":null,"props":{"points":"10,40 20,30 30,40 40,30 50,40 60,30 70,40","stroke":"rgb(0,0,0)","strokeWidth":2,"strokeOpacity":"1","fill":"none"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
};
