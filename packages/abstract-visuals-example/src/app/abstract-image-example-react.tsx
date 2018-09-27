import * as React from "react";
import * as AbstractImage from "abstract-image";

export function AbstractImageExampleReact(): JSX.Element {
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
    AbstractImage.createRectangle(
      AbstractImage.createPoint(60, 50),
      AbstractImage.createPoint(90, 80),
      AbstractImage.blue,
      2,
      AbstractImage.transparent
    )
  ];
  const image = AbstractImage.createAbstractImage(
    AbstractImage.createPoint(0, 0),
    AbstractImage.createSize(400, 400),
    AbstractImage.white,
    components
  );
  const svg = AbstractImage.createReactSvg(image, {
    onClick: id => window.alert(id)
  });
  return (
    <div>
      <h1>React</h1>
      {svg}
    </div>
  );
}
