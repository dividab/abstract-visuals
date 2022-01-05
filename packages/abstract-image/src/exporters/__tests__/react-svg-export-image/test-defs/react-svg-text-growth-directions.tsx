import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

const components = [
  AbstractImage.createText(
    AbstractImage.createPoint(10, 10),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "bold",
    0,
    "center",
    "left",
    "up",
    2,
    AbstractImage.red,
    false
  ),
  AbstractImage.createText(
    AbstractImage.createPoint(10, 30),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "bold",
    0,
    "center",
    "uniform",
    "uniform",
    2,
    AbstractImage.red,
    false
  ),
  AbstractImage.createText(
    AbstractImage.createPoint(10, 50),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "bold",
    0,
    "left",
    "right",
    "down",
    2,
    AbstractImage.red,
    false
  ),
  AbstractImage.createText(
    AbstractImage.createPoint(10, 70),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "bold",
    0,
    "right",
    "right",
    "down",
    2,
    AbstractImage.red,
    false
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
  name: "react svg text growth directions",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"type":"svg","key":null,"ref":null,"props":{"id":"ai_root","width":"400px","height":"400px","viewBox":"0 0 400 400","children":[{"type":"text","key":"0shadow","ref":null,"props":{"style":{"textAnchor":"end","fontSize":"12px","fontWeight":"bold","fontFamily":"Arial","stroke":"rgb(255,0,0)","strokeWidth":2},"transform":"rotate(0 10 10)","children":[{"type":"tspan","key":"Hello World","ref":null,"props":{"x":10,"y":10,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Hello World"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}},{"type":"text","key":"0","ref":null,"props":{"style":{"textAnchor":"end","fontSize":"12px","fontWeight":"bold","fontFamily":"Arial","fill":"rgb(0,0,0)"},"transform":"rotate(0 10 10)","children":[{"type":"tspan","key":"Hello World","ref":null,"props":{"x":10,"y":10,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Hello World"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}},{"type":"text","key":"1shadow","ref":null,"props":{"style":{"textAnchor":"middle","fontSize":"12px","fontWeight":"bold","fontFamily":"Arial","stroke":"rgb(255,0,0)","strokeWidth":2},"transform":"rotate(0 10 30)","children":[{"type":"tspan","key":"Hello World","ref":null,"props":{"x":10,"y":36,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Hello World"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}},{"type":"text","key":"1","ref":null,"props":{"style":{"textAnchor":"middle","fontSize":"12px","fontWeight":"bold","fontFamily":"Arial","fill":"rgb(0,0,0)"},"transform":"rotate(0 10 30)","children":[{"type":"tspan","key":"Hello World","ref":null,"props":{"x":10,"y":36,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Hello World"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}},{"type":"text","key":"2shadow","ref":null,"props":{"style":{"textAnchor":"start","fontSize":"12px","fontWeight":"bold","fontFamily":"Arial","stroke":"rgb(255,0,0)","strokeWidth":2},"transform":"rotate(0 10 50)","children":[{"type":"tspan","key":"Hello World","ref":null,"props":{"x":10,"y":62,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Hello World"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}},{"type":"text","key":"2","ref":null,"props":{"style":{"textAnchor":"start","fontSize":"12px","fontWeight":"bold","fontFamily":"Arial","fill":"rgb(0,0,0)"},"transform":"rotate(0 10 50)","children":[{"type":"tspan","key":"Hello World","ref":null,"props":{"x":10,"y":62,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Hello World"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}},{"type":"text","key":"3shadow","ref":null,"props":{"style":{"textAnchor":"start","fontSize":"12px","fontWeight":"bold","fontFamily":"Arial","stroke":"rgb(255,0,0)","strokeWidth":2},"transform":"rotate(0 10 70)","children":[{"type":"tspan","key":"Hello World","ref":null,"props":{"x":10,"y":82,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Hello World"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}},{"type":"text","key":"3","ref":null,"props":{"style":{"textAnchor":"start","fontSize":"12px","fontWeight":"bold","fontFamily":"Arial","fill":"rgb(0,0,0)"},"transform":"rotate(0 10 70)","children":[{"type":"tspan","key":"Hello World","ref":null,"props":{"x":10,"y":82,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Hello World"},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
};
