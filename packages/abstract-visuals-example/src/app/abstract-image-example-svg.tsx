import React from "react";
import {
  createLine,
  createPoint,
  red,
  createDashStyle,
  black,
  createRectangle,
  blue,
  fromArgb,
  transparent,
  createText,
  createAbstractImage,
  createSize,
  white,
  createSVG,
} from "../../../abstract-image/src/index.js";

export function AbstractImageExampleSvg(): React.JSX.Element {
  const components = [
    createLine(createPoint(25, 125), createPoint(280, 125), red, 2, undefined, createDashStyle([10, 5])),
    createLine(createPoint(25, 100), createPoint(280, 100), red, 2, undefined, createDashStyle([10, 5], 5)),
    createLine(createPoint(25, 25), createPoint(80, 60), black, 2),
    createRectangle(createPoint(10, 50), createPoint(40, 80), blue, 2, fromArgb(100, 0, 0, 0)),
    createRectangle(createPoint(60, 50), createPoint(90, 80), blue, 2, transparent),
    createText(
      createPoint(60, 50),
      "Hej<sub>12</sub>",
      "Helvetica",
      12,
      black,
      "normal",
      0,
      "center",
      "uniform",
      "uniform",
      0,
      black,
      false
    ),
  ];
  const image = createAbstractImage(createPoint(0, 0), createSize(400, 400), white, components);
  const svg = createSVG(image);
  return (
    <div>
      <h1>Svg</h1>
      <p>Test</p>
      <pre>{svg}</pre>
      <img width="400" height="400" src={`data:image/svg+xml;,${svg}`} />
    </div>
  );
}
