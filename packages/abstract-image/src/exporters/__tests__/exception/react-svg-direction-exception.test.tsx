/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import * as AbstractImage from "../../../../src/index";

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
    "down",
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

describe("react svg text unknown direction", () => {
  it("should throw an exception", () =>
    expect(() => render(AbstractImage.createReactSvg(image))).toThrow("Unknown text anchor down"));
});

const components2 = [
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
    "right",
    2,
    AbstractImage.red,
    false
  ),
];
const image2 = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components2
);

describe("react svg text unknown direction", () => {
  it("should throw an exception", () => {
    expect(() => render(AbstractImage.createReactSvg(image2))).toThrow("Unknown text alignment right");
  });
});
