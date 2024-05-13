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
  name: "react svg text",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"type":"svg","key":null,"ref":null,"props":{"id":"ai_root","width":"400px","height":"400px","viewBox":"0 0 400 400","children":[{"key":"0","ref":null,"props":{"component":{"type":"text","position":{"x":10,"y":10},"text":"Hello World","fontFamily":"Arial","fontSize":12,"textColor":{"a":255,"r":0,"g":0,"b":0},"fontWeight":"normal","clockwiseRotationDegrees":0,"textAlignment":"center","horizontalGrowthDirection":"right","verticalGrowthDirection":"down","strokeThickness":2,"strokeColor":{"a":255,"r":255,"g":0,"b":0},"italic":false}},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
};
