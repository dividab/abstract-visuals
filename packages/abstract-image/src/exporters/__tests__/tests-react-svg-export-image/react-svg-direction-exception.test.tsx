import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as AbstractImage from "../../../index.js";
import { ReactSvg } from "../../../index.js";

describe("react svg text unknown direction", () => {
  it("should throw an exception for an unknown horizontal growth direction", () => {
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
    expect(() => renderToStaticMarkup(<ReactSvg image={image} />)).toThrow("Unknown text anchor down");
  });

  it("should throw an exception for an unknown vertical growth direction", () => {
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
    expect(() => renderToStaticMarkup(<ReactSvg image={image} />)).toThrow("Unknown text alignment right");
  });
});
