import React from "react";
import {
  createLine,
  createPoint,
  green,
  createRectangle,
  blue,
  red,
  createText,
  black,
  createEllipse,
  createPolyLine,
  brown,
  createPolygon,
  yellow,
  gray,
  createAbstractImage,
  createSize,
  white,
  createSVG,
  dxf2dExportImage,
  epsExportImage,
} from "../../../abstract-image/src/index.js";

export function AbstractImageExampleDxf(): React.JSX.Element {
  const components = [
    createLine(createPoint(200, 0), createPoint(200, 400), green, 1),
    createLine(createPoint(0, 200), createPoint(400, 200), green, 1),
    createRectangle(createPoint(10, 50), createPoint(40, 80), blue, 2, red),
    createText(
      createPoint(200, 200),
      "Test",
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
    createEllipse(createPoint(80, 40), createPoint(100, 60), black, 1, blue),
    createPolyLine([createPoint(10, 10), createPoint(390, 390), createPoint(390, 10)], brown, 2),
    createPolygon([createPoint(200, 250), createPoint(250, 250), createPoint(200, 200)], yellow, 2, gray),
  ];
  const image = createAbstractImage(createPoint(0, 0), createSize(400, 400), white, components);
  const svg = createSVG(image);
  const base64 = btoa(svg);

  const dxf = dxf2dExportImage(image);
  const dxfUrl = toDataUrl("text/plain", dxf);

  const eps = epsExportImage(image);
  const epsUrl = toDataUrl("text/plain", eps);

  return (
    <div>
      <h1>DXF</h1>
      <img width="400" height="400" src={`data:image/svg+xml;base64,${base64}`} />
      <a href={dxfUrl} download={"abstract_image_demo1.dxf"}>
        Download DXF
      </a>
      <pre>{dxf}</pre>
      <a href={epsUrl} download={"abstract_image_demo1.eps"}>
        Download EPS
      </a>
      <pre>{eps}</pre>
    </div>
  );
}

function toDataUrl(mime: string, data: string): string {
  const base64 = btoa(data);
  return `data:${mime};base64,${base64}`;
}
