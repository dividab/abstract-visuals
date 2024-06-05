import * as React from "react";
import * as AI from "../../../abstract-image";

export function AbstractImageExampleDxf(): JSX.Element {
  const components = [
    AI.createLine(AI.createPoint(200, 0), AI.createPoint(200, 400), AI.green, 1),
    AI.createLine(AI.createPoint(0, 200), AI.createPoint(400, 200), AI.green, 1),
    AI.createRectangle(AI.createPoint(10, 50), AI.createPoint(40, 80), AI.blue, 2, AI.red),
    AI.createText(
      AI.createPoint(200, 200),
      "Test",
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
    AI.createEllipse(AI.createPoint(80, 40), AI.createPoint(100, 60), AI.black, 1, AI.blue),
    AI.createPolyLine([AI.createPoint(10, 10), AI.createPoint(390, 390), AI.createPoint(390, 10)], AI.brown, 2),
    AI.createPolygon(
      [AI.createPoint(200, 250), AI.createPoint(250, 250), AI.createPoint(200, 200)],
      AI.yellow,
      2,
      AI.gray
    ),
  ];
  const image = AI.createAbstractImage(AI.createPoint(0, 0), AI.createSize(400, 400), AI.white, components);
  const svg = AI.createSVG(image);
  const base64 = btoa(svg);

  const dxf = AI.dxf2dExportImage(image);
  const dxfUrl = toDataUrl("text/plain", dxf);

  const eps = AI.epsExportImage(image);
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
