import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";
import Enzyme from "enzyme";
import React from "react";
import Adapter from "enzyme-adapter-react-16";

Enzyme.configure({ adapter: new Adapter() });

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
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

// eslint-disable-next-line functional/no-let
let testVariable = "not clicked";

const svg = AbstractImage.createReactSvg(image, {
  onClick: (id: string | undefined, point: AbstractImage.Point) => {
    testVariable = "clicked";
  },
});

const wrapper = Enzyme.shallow(svg);
wrapper.find("svg").simulate("click", {
  currentTarget: {
    getBoundingClientRect: () => {
      return { left: 0, top: 0 };
    },
  },
  clientX: 10,
  clientY: 10,
  target: {
    id: "test",
  },
});

export const test: ExportTestDef = {
  name: "react svg text",
  abstractImage: testVariable,
  expectedSerializedJsx: '"clicked"',
};
