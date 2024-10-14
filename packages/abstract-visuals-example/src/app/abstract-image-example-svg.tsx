import * as React from "react";
import * as AI from "../../../abstract-image";

export function AbstractImageExampleSvg(): JSX.Element {
  const components = [
    AI.createLine(AI.createPoint(25, 125), AI.createPoint(280, 125), AI.red, 2, undefined, AI.createDashStyle([10, 5])),
    AI.createLine(
      AI.createPoint(25, 100),
      AI.createPoint(280, 100),
      AI.red,
      2,
      undefined,
      AI.createDashStyle([10, 5], 5)
    ),
    AI.createLine(AI.createPoint(25, 25), AI.createPoint(80, 60), AI.black, 2),
    AI.createRectangle(AI.createPoint(10, 50), AI.createPoint(40, 80), AI.blue, 2, AI.fromArgb(100, 0, 0, 0)),
    AI.createRectangle(AI.createPoint(60, 50), AI.createPoint(90, 80), AI.blue, 2, AI.transparent),
    AI.createText(
      AI.createPoint(60, 50),
      "Hej<sub>12</sub>",
      "Helvetica",
      12,
      AI.black,
      "normal",
      0,
      "center",
      "uniform",
      "uniform",
      0,
      AI.black,
      false
    ),
  ];
  const image = AI.createAbstractImage(AI.createPoint(0, 0), AI.createSize(400, 400), AI.white, components);
  const svg = AI.createSVG(image);
  return (
    <div>
      <h1>Svg</h1>
      <p>Test</p>
      <pre>{svg}</pre>
      <img width="400" height="400" src={`data:image/svg+xml;,${svg}`} />
    </div>
  );
}
