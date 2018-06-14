import * as React from "react";
import * as AbstractImage from "abstract-image";

export function AbstractImageExampleDxf(): JSX.Element {
  const components = [
    AbstractImage.createLine(
      AbstractImage.createPoint(25, 25),
      AbstractImage.createPoint(80, 60),
      AbstractImage.green,
      2
    ),
    AbstractImage.createRectangle(
      AbstractImage.createPoint(10, 50),
      AbstractImage.createPoint(40, 80),
      AbstractImage.blue,
      2,
      AbstractImage.red
    ),
    AbstractImage.createEllipse(
      AbstractImage.createPoint(80, 40),
      AbstractImage.createPoint(100, 60),
      AbstractImage.black,
      1,
      AbstractImage.transparent
    )
  ];
  const image = AbstractImage.createAbstractImage(
    AbstractImage.createPoint(0, 0),
    AbstractImage.createSize(400, 400),
    AbstractImage.white,
    components
  );
  const dxf = AbstractImage.dxf2dExportImage(image);
  const svg = AbstractImage.createSVG(image);
  const base64 = btoa(svg);

  // Create a new blob from the data.
  const blob = new Blob([dxf], { type: "text/plain", endings: "native" });
  // Create a data:url which points to that data.
  const url = URL.createObjectURL(blob);

  return (
    <div>
      <h1>DXF</h1>
      <img
        width="400"
        height="400"
        src={`data:image/svg+xml;base64,${base64}`}
      />
      <a href={url} download={"abstract_image_demo1.dxf"}>
        Download DXF
      </a>
      <pre>{dxf}</pre>
    </div>
  );
}
