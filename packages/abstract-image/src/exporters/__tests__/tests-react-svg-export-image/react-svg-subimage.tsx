import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const subImage = AbstractImage.createText(
  AbstractImage.createPoint(10, 10),
  "",
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
  false
);

const components = [AbstractImage.createSubImage(AbstractImage.createPoint(10, 10), subImage)];

const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const svg = AbstractImage.createReactSvg(image);

export const testReactSvgSubImage: ExportTestDef = {
  name: "react svg subimage",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"type":"svg","key":null,"ref":null,"props":{"id":"ai_root","width":"400px","height":"400px","viewBox":"0 0 400 400","children":[{"key":"0","ref":null,"props":{"component":{"type":"subimage","topLeft":{"x":10,"y":10},"image":{"type":"text","position":{"x":10,"y":10},"text":"","fontFamily":"Arial","fontSize":12,"textColor":{"a":255,"r":0,"g":0,"b":0},"fontWeight":"bold","clockwiseRotationDegrees":0,"textAlignment":"center","horizontalGrowthDirection":"right","verticalGrowthDirection":"down","strokeThickness":2,"strokeColor":{"a":255,"r":255,"g":0,"b":0},"italic":false}}},"_owner":null,"_store":{}}]},"_owner":null,"_store":{}}',
};