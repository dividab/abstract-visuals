import * as AbstractImage from "../../../../src/index";

describe("svg text unknown direction", () => {
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
      const svg = AbstractImage.createSVG(image);
    }).toThrow("Unknown text anchor down");
  });
});

describe("svg text unknown direction", () => {
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
      const svg = AbstractImage.createSVG(image);
    }).toThrow("Unknown text alignment right");
  });
});
