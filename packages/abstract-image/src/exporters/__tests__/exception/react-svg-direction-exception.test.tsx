import * as AbstractImage from "../../../../src/index";

describe("react svg text unknown direction", () => {
  it("should throw an exception", () => {
    expect(() => {
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
          AbstractImage.red
        ),
      ];
      const image = AbstractImage.createAbstractImage(
        AbstractImage.createPoint(0, 0),
        AbstractImage.createSize(400, 400),
        AbstractImage.white,
        components
      );

      const svg = AbstractImage.createReactSvg(image);
    }).toThrow("Unknown text alignment down");
  });
});

describe("react svg text unknown direction", () => {
  it("should throw an exception", () => {
    expect(() => {
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
          "right",
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

      const svg = AbstractImage.createReactSvg(image);
    }).toThrow("Unknown text alignment right");
  });
});
