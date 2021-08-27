import * as React from "react";
import { Meta } from "@storybook/react";
import * as AbstractImage from "../..";

export function ReactSvgExportExample1(): React.ReactElement<{}> {
  const components = [
    AbstractImage.createLine(
      AbstractImage.createPoint(0, 200),
      AbstractImage.createPoint(400, 200),
      AbstractImage.black,
      1
    ),
    AbstractImage.createLine(
      AbstractImage.createPoint(200, 0),
      AbstractImage.createPoint(200, 400),
      AbstractImage.black,
      1
    ),
    AbstractImage.createText(
      AbstractImage.createPoint(200, 200),
      "Testing texting",
      "Arial",
      20,
      AbstractImage.black,
      "normal",
      0,
      "center",
      "uniform",
      "down",
      0,
      AbstractImage.black
    ),
  ];
  const image = AbstractImage.createAbstractImage(
    AbstractImage.createPoint(0, 0),
    AbstractImage.createSize(400, 400),
    AbstractImage.white,
    components
  );
  const svg = AbstractImage.createReactSvg(image);
  return (
    <div>
      <h1>React Svg</h1>
      <pre>{svg}</pre>
    </div>
  );
}

// eslint-disable-next-line import/no-default-export
export default {
  component: ReactSvgExportExample1,
  title: "ReactSvgExportExample1",
} as Meta;
