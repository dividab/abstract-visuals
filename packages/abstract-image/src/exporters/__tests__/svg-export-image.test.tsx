import { describe, test, expect } from "vitest";
import { testSvgBinary } from "./tests-svg-export-image/svg-binary.js";
import { testSvgDashedLine } from "./tests-svg-export-image/svg-dashed-line.js";
import { testSvgEllpise } from "./tests-svg-export-image/svg-ellipse.js";
import { testSvgEmptyText } from "./tests-svg-export-image/svg-empty-text.js";
import { testSvgGroup } from "./tests-svg-export-image/svg-group.js";
import { testSvgLine } from "./tests-svg-export-image/svg-line.js";
import { testSvgPolygon } from "./tests-svg-export-image/svg-polygon.js";
import { testSvgPolyline } from "./tests-svg-export-image/svg-polyline.js";
import { testSvgRectangle } from "./tests-svg-export-image/svg-rectangle.js";
import { testSvgTextBold } from "./tests-svg-export-image/svg-text-bold.js";
import { testSvgTextGrowthDirections } from "./tests-svg-export-image/svg-text-growth-directions.js";
import { testSvgTextItalic } from "./tests-svg-export-image/svg-text-italic.js";
import { testSvgText } from "./tests-svg-export-image/svg-text.js";

describe("svg-export-image", () => {
  [
    testSvgBinary,
    testSvgDashedLine,
    testSvgDashedLine,
    testSvgEllpise,
    testSvgEmptyText,
    testSvgGroup,
    testSvgLine,
    testSvgPolygon,
    testSvgPolyline,
    testSvgRectangle,
    testSvgTextBold,
    testSvgTextGrowthDirections,
    testSvgTextItalic,
    testSvgText,
  ].forEach((item) => {
    test(item.name, () => {
      expect(item.abstractImage).toEqual(item.expectedImage);
    });
  });
});
