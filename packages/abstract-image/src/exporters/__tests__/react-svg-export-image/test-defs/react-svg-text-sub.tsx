import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

const components = [
  AbstractImage.createText(
    AbstractImage.createPoint(10, 10),
    "Hello <sub>World</sub>",
    "Arial",
    12,
    AbstractImage.black,
    "bold",
    0,
    "center",
    "right",
    "down",
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
  name: "react svg text sub",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"type":"svg","key":null,"ref":null,"props":{"id":"ai_root","width":"400px","height":"400px","viewBox":"0 0 400 400","children":[{"type":"text","key":"0shadow","ref":null,"props":{"style":{"textAnchor":"start","fontSize":"12px","fontWeight":"bold","fontFamily":"Arial","stroke":"rgb(255,0,0)","strokeWidth":2},"transform":"rotate(0 10 10)","children":[{"type":"tspan","key":"Hello <sub>World</sub>","ref":null,"props":{"x":10,"y":22,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Hello "},"_owner":null,"_store":{}},{"type":"tspan","key":"1","ref":null,"props":{"baselineShift":"sub","style":{"fontSize":"9.600000000000001px"},"children":"World"},"_owner":null,"_store":{}},{"type":"tspan","key":"2","ref":null,"props":{"children":""},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}},{"type":"text","key":"0","ref":null,"props":{"style":{"textAnchor":"start","fontSize":"12px","fontWeight":"bold","fontFamily":"Arial","fill":"rgb(0,0,0)"},"transform":"rotate(0 10 10)","children":[{"type":"tspan","key":"Hello <sub>World</sub>","ref":null,"props":{"x":10,"y":22,"height":"12px","children":[{"type":"tspan","key":"0","ref":null,"props":{"children":"Hello "},"_owner":null,"_store":{}},{"type":"tspan","key":"1","ref":null,"props":{"baselineShift":"sub","style":{"fontSize":"9.600000000000001px"},"children":"World"},"_owner":null,"_store":{}},{"type":"tspan","key":"2","ref":null,"props":{"children":""},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
};
