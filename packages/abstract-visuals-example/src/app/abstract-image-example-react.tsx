import * as React from "react";
import * as AbstractImage from "../../../abstract-image";

export function AbstractImageExampleReact(): JSX.Element {
  const subComponents = [
    AbstractImage.createLine(
      AbstractImage.createPoint(50, 50),
      AbstractImage.createPoint(80, 60),
      AbstractImage.red,
      2,
      "subLine"
    ),
  ];
  const subImage = AbstractImage.createAbstractImage(
    AbstractImage.createPoint(0, 0),
    AbstractImage.createSize(400, 400),
    AbstractImage.white,
    subComponents
  );
  const subSvg = AbstractImage.createSVG(subImage);
  const subData = new TextEncoder().encode(subSvg);

  const components = [
    AbstractImage.createLine(
      AbstractImage.createPoint(25, 25),
      AbstractImage.createPoint(80, 60),
      AbstractImage.black,
      2
    ),
    AbstractImage.createRectangle(
      AbstractImage.createPoint(10, 50),
      AbstractImage.createPoint(40, 80),
      AbstractImage.blue,
      2,
      AbstractImage.fromArgb(100, 0, 0, 0),
      "rect"
    ),
    AbstractImage.createBinaryImage(
      AbstractImage.createPoint(0, 0),
      AbstractImage.createPoint(300, 300),
      "svg",
      subData,
      "subImage"
    ),
    AbstractImage.createEllipse(
      AbstractImage.createPoint(20, 20),
      AbstractImage.createPoint(60, 60),
      AbstractImage.red,
      1,
      AbstractImage.transparent
    ),
    AbstractImage.createText(
      AbstractImage.createPoint(60, 50),
      "Hej<sub>12</sub>",
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
  ];
  const image = AbstractImage.createAbstractImage(
    AbstractImage.createPoint(0, 0),
    AbstractImage.createSize(400, 400),
    AbstractImage.white,
    components
  );
  const svg = AbstractImage.createReactSvg(image, {
    onClick: (id, position) => window.alert(JSON.stringify({ id, position })),
  });
  return (
    <div>
      <h1>React</h1>
      <div>{svg}</div>
    </div>
  );
}
