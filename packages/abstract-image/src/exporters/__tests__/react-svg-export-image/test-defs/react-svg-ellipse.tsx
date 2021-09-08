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
    '{"type":"svg","key":null,"ref":null,"props":{"id":"ai_root","width":"400px","height":"400px","viewBox":"0 0 400 400","children":[{"type":"ellipse","key":"0","ref":null,"props":{"cx":75,"cy":75,"rx":25,"ry":25,"stroke":"rgb(0,128,0)","strokeWidth":2,"strokeOpacity":"1","fillOpacity":"1","fill":"rgb(255,255,0)"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
};
