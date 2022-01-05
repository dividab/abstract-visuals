import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

const components = [
  AbstractImage.createText(
    AbstractImage.createPoint(10, 10),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "normal",
    0,
    "center",
    "right",
    "down",
    2,
    AbstractImage.red,
    true
  ),
  AbstractImage.createText(
    AbstractImage.createPoint(20, 20),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "bold",
    0,
    "center",
    "right",
    "down",
    2,
    AbstractImage.red,
    true
  ),
  AbstractImage.createText(
    AbstractImage.createPoint(30, 30),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "mediumBold",
    0,
    "center",
    "right",
    "down",
    2,
    AbstractImage.red,
    true
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
  name: "react svg text bold",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"type":"svg","key":null,"ref":null,"props":{"id":"ai_root","width":"400px","height":"400px","viewBox":"0 0 400 400","children":[{"type":"text","key":"0shadow","ref":null,"props":{"style":{"textAnchor":"start","fontSize":"12px","fontWeight":"normal","fontFamily":"Arial","stroke":"rgb(255,0,0)","strokeWidth":2},"transform":"rotate(0 10 10)","children":[{"type":"tspan","key":"Hello World","ref":null,"props":{"x":10,"y":22,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Hello World"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}},{"type":"text","key":"0","ref":null,"props":{"style":{"textAnchor":"start","fontSize":"12px","fontWeight":"normal","fontFamily":"Arial","fill":"rgb(0,0,0)"},"transform":"rotate(0 10 10)","children":[{"type":"tspan","key":"Hello World","ref":null,"props":{"x":10,"y":22,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Hello World"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}},{"type":"text","key":"1shadow","ref":null,"props":{"style":{"textAnchor":"start","fontSize":"12px","fontWeight":"bold","fontFamily":"Arial","stroke":"rgb(255,0,0)","strokeWidth":2},"transform":"rotate(0 20 20)","children":[{"type":"tspan","key":"Hello World","ref":null,"props":{"x":20,"y":32,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Hello World"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}},{"type":"text","key":"1","ref":null,"props":{"style":{"textAnchor":"start","fontSize":"12px","fontWeight":"bold","fontFamily":"Arial","fill":"rgb(0,0,0)"},"transform":"rotate(0 20 20)","children":[{"type":"tspan","key":"Hello World","ref":null,"props":{"x":20,"y":32,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Hello World"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}},{"type":"text","key":"2shadow","ref":null,"props":{"style":{"textAnchor":"start","fontSize":"12px","fontWeight":"bold","fontFamily":"Arial","stroke":"rgb(255,0,0)","strokeWidth":2},"transform":"rotate(0 30 30)","children":[{"type":"tspan","key":"Hello World","ref":null,"props":{"x":30,"y":42,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Hello World"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}},{"type":"text","key":"2","ref":null,"props":{"style":{"textAnchor":"start","fontSize":"12px","fontWeight":"bold","fontFamily":"Arial","fill":"rgb(0,0,0)"},"transform":"rotate(0 30 30)","children":[{"type":"tspan","key":"Hello World","ref":null,"props":{"x":30,"y":42,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Hello World"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
};
