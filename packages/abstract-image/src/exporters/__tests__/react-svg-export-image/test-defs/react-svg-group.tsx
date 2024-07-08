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
    '{"type":"svg","key":null,"ref":null,"props":{"id":"ai_root","width":"400px","height":"400px","viewBox":"0 0 400 400","children":[{"key":"0","ref":null,"props":{"component":{"type":"group","name":"group","children":[{"type":"text","position":{"x":200,"y":200},"text":"Test","fontFamily":"Helvetica","fontSize":12,"textColor":{"a":255,"r":0,"g":0,"b":0},"fontWeight":"normal","clockwiseRotationDegrees":0,"textAlignment":"center","horizontalGrowthDirection":"uniform","verticalGrowthDirection":"uniform","strokeThickness":0,"strokeColor":{"a":255,"r":0,"g":0,"b":0},"italic":false},{"type":"rectangle","topLeft":{"x":10,"y":50},"bottomRight":{"x":50,"y":60},"strokeColor":{"a":255,"r":0,"g":0,"b":255},"strokeThickness":2,"strokeDashStyle":{"dashes":[],"offset":0},"fillColor":{"a":255,"r":255,"g":0,"b":0}}]}},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
};
