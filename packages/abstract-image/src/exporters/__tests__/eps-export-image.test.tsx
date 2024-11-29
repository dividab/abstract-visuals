import { describe, test, expect } from "vitest";
import { testEpsEllipse } from "./tests-eps-export-image/eps-ellipse.js";
import { testEpsEmptyText } from "./tests-eps-export-image/eps-empty-text.js";
import { testEpsGroup } from "./tests-eps-export-image/eps-group.js";
import { testEpsIsoLatin1Encoding } from "./tests-eps-export-image/eps-text-iso-latin1-encoding.js";
import { testEpsTextGrowthDirections } from "./tests-eps-export-image/eps-text-growth-directions.js";
import { testEpsText } from "./tests-eps-export-image/eps-text.js";
import { testEpsLine } from "./tests-eps-export-image/eps-line.js";
import { testEpsPolygon } from "./tests-eps-export-image/eps-polygon.js";
import { testEpsRectangle } from "./tests-eps-export-image/eps-rectangle.js";
import { testEpsPolyline } from "./tests-eps-export-image/eps-polyline.js";

describe("eps-export-image", () => {
  [
    testEpsEllipse,
    testEpsEmptyText,
    testEpsGroup,
    testEpsLine,
    testEpsPolygon,
    testEpsPolyline,
    testEpsRectangle,
    testEpsTextGrowthDirections,
    testEpsIsoLatin1Encoding,
    testEpsText,
  ].forEach((item) => {
    test(item.name, () => {
      expect(item.abstractImage).toEqual(item.expectedImage);
    });
  });
});
