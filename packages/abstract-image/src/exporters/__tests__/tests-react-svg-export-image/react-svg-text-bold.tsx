import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

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
    "right",
    "down",
    2,
    AbstractImage.red,
    false
  ),
  AbstractImage.createText(
    AbstractImage.createPoint(10, 10),
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
    false
  ),
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const svg = <AbstractImage.ReactSvg image={image} />;

export const testReactSvgBold: ExportTestDef = {
  name: "react svg text bold",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"key":null,"props":{"image":{"topLeft":{"x":0,"y":0},"size":{"width":400,"height":400},"backgroundColor":{"a":255,"r":255,"g":255,"b":255},"components":[{"type":"text","position":{"x":10,"y":10},"text":"Hello World","fontFamily":"Arial","fontSize":12,"textColor":{"a":255,"r":0,"g":0,"b":0},"fontWeight":"bold","clockwiseRotationDegrees":0,"textAlignment":"center","horizontalGrowthDirection":"right","verticalGrowthDirection":"down","strokeThickness":2,"strokeColor":{"a":255,"r":255,"g":0,"b":0},"italic":false},{"type":"text","position":{"x":10,"y":10},"text":"Hello World","fontFamily":"Arial","fontSize":12,"textColor":{"a":255,"r":0,"g":0,"b":0},"fontWeight":"mediumBold","clockwiseRotationDegrees":0,"textAlignment":"center","horizontalGrowthDirection":"right","verticalGrowthDirection":"down","strokeThickness":2,"strokeColor":{"a":255,"r":255,"g":0,"b":0},"italic":false}]}},"_owner":null,"_store":{}}',
};
