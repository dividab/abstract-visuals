import * as React from "react";
import { Meta } from "@storybook/react";
import * as AbstractImage from "../../index.js";

export function SvgExportExample1(): React.ReactElement<{}> {
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
      AbstractImage.red
    ),
  ];
  const image = AbstractImage.createAbstractImage(
    AbstractImage.createPoint(0, 0),
    AbstractImage.createSize(400, 400),
    AbstractImage.white,
    components
  );
  const svg = AbstractImage.createSVG(image);
  const base64 = btoa(svg);
  return (
    <div>
      <h1>Svg</h1>
      <pre>{svg}</pre>
      <img src={`data:image/svg+xml;base64,${base64}`} />
    </div>
  );
}

// eslint-disable-next-line import/no-default-export
export default {
  component: SvgExportExample1,
  title: "SvgExportExample1",
} as Meta;
