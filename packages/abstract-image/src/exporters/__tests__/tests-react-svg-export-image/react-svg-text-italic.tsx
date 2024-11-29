import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

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

export const testReactSvgItalic: ExportTestDef = {
  name: "react svg text italic",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"type":"svg","key":null,"ref":null,"props":{"id":"ai_root","width":"400px","height":"400px","viewBox":"0 0 400 400","children":[{"key":"0","ref":null,"props":{"component":{"type":"text","position":{"x":10,"y":10},"text":"Hello World","fontFamily":"Arial","fontSize":12,"textColor":{"a":255,"r":0,"g":0,"b":0},"fontWeight":"normal","clockwiseRotationDegrees":0,"textAlignment":"center","horizontalGrowthDirection":"right","verticalGrowthDirection":"down","strokeThickness":2,"strokeColor":{"a":255,"r":255,"g":0,"b":0},"italic":true}},"_owner":null,"_store":{}},{"key":"1","ref":null,"props":{"component":{"type":"text","position":{"x":20,"y":20},"text":"Hello World","fontFamily":"Arial","fontSize":12,"textColor":{"a":255,"r":0,"g":0,"b":0},"fontWeight":"bold","clockwiseRotationDegrees":0,"textAlignment":"center","horizontalGrowthDirection":"right","verticalGrowthDirection":"down","strokeThickness":2,"strokeColor":{"a":255,"r":255,"g":0,"b":0},"italic":true}},"_owner":null,"_store":{}},{"key":"2","ref":null,"props":{"component":{"type":"text","position":{"x":30,"y":30},"text":"Hello World","fontFamily":"Arial","fontSize":12,"textColor":{"a":255,"r":0,"g":0,"b":0},"fontWeight":"mediumBold","clockwiseRotationDegrees":0,"textAlignment":"center","horizontalGrowthDirection":"right","verticalGrowthDirection":"down","strokeThickness":2,"strokeColor":{"a":255,"r":255,"g":0,"b":0},"italic":true}},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
};
