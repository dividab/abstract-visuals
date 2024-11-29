import { describe, test, expect } from "vitest";
import { testDxf2dPolyline } from "./tests-dxf2d-export-image/dxf2d-polyline.js";
import { testDxf2dRectangle } from "./tests-dxf2d-export-image/dxf2d-rectangle.js";
import { testDxf2dEllipse } from "./tests-dxf2d-export-image/dxf2d-ellipse.js";
import { testDxf2dGroup } from "./tests-dxf2d-export-image/dxf2d-group.js";
import { testDxf2dTextGrowthDirections } from "./tests-dxf2d-export-image/dxf2d-text-growth-directions.js";
import { testDxf2dLine } from "./tests-dxf2d-export-image/dxf2d-line.js";
import { testDxf2dPolygon } from "./tests-dxf2d-export-image/dxf2d-polygon.js";
import { testDxf2dText } from "./tests-dxf2d-export-image/dxf2d-text.js";

describe("dxf2d-export-image", () => {
  [
    testDxf2dEllipse,
    testDxf2dGroup,
    testDxf2dLine,
    testDxf2dPolygon,
    testDxf2dPolyline,
    testDxf2dRectangle,
    testDxf2dTextGrowthDirections,
    testDxf2dText,
  ].forEach((item) => {
    test(item.name, () => {
      expect(item.abstractImage).toEqual(item.expectedImage);
    });
  });
});
