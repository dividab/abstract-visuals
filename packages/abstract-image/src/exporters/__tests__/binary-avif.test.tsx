import { renderToStaticMarkup } from "react-dom/server";
import { describe, test, expect } from "vitest";
import * as AbstractImage from "../../index.js";
import { ReactSvg } from "../../index.js";

// 8x8 px AVIF
const avifEncoded =
  "AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAACAAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAgAAAAIAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAChtZGF0EgAKCBgIv2CBAQNCMhIYAAooooQAQbJEjZ90X1TtD6A=";

const binaryImage = AbstractImage.createBinaryImage(AbstractImage.createPoint(0, 0), AbstractImage.createPoint(400, 400), "avif", {
  type: "bytes",
  bytes: Buffer.from(avifEncoded, "base64"),
});
const abstractImage = AbstractImage.createAbstractImage(AbstractImage.createPoint(0, 0), AbstractImage.createSize(400, 400), AbstractImage.white, [
  binaryImage,
]);

describe("binary avif", () => {
  test("svg", () => {
    expect(AbstractImage.createSVG(abstractImage)).toEqual(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400px" height="400px" viewBox="0 0 400 400"><image x="0" y="0" width="400" height="400" href="data:image/avif;base64,${avifEncoded}"></image></svg>`
    );
  });

  test("react svg", () => {
    expect(renderToStaticMarkup(<ReactSvg image={abstractImage} />)).toContain(
      `<image x="0" y="0" width="400" height="400" href="data:image/avif;base64,${avifEncoded}"></image>`
    );
  });
});
