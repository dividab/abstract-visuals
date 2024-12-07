import { describe, test, expect } from "vitest";
import { testReactSvgBinaryPng } from "./tests-react-svg-export-image/react-svg-binary-png.js";
import { testReactSvgBinaryUrl } from "./tests-react-svg-export-image/react-svg-binary-url.js";
import { testReactSvgBinary } from "./tests-react-svg-export-image/react-svg-binary.js";
import { testReactSvgCallback } from "./tests-react-svg-export-image/react-svg-callback.js";
import { testReactSvgBold } from "./tests-react-svg-export-image/react-svg-text-bold.js";
import { testReactSvgDashedLine } from "./tests-react-svg-export-image/react-svg-dashed-line.js";
import { testReactSvgEllipse } from "./tests-react-svg-export-image/react-svg-ellipse.js";
import { testReactSvgEmptyText } from "./tests-react-svg-export-image/react-svg-empty-text.js";
import { testReactSvgGroup } from "./tests-react-svg-export-image/react-svg-group.js";
import { testReactSvgLine } from "./tests-react-svg-export-image/react-svg-line.js";
import { testReactSvgPolygon } from "./tests-react-svg-export-image/react-svg-polygon.js";
import { testReactSvgPolyline } from "./tests-react-svg-export-image/react-svg-polyline.js";
import { testReactSvgSubImage } from "./tests-react-svg-export-image/react-svg-subimage.js";
import { testReactSvgTextGrowthDirections } from "./tests-react-svg-export-image/react-svg-text-growth-directions.js";
import { testReactSvgItalic } from "./tests-react-svg-export-image/react-svg-text-italic.js";
import { testReactSvgSub } from "./tests-react-svg-export-image/react-svg-text-sub.js";
import { testReactSvgText } from "./tests-react-svg-export-image/react-svg-text.js";
import { testReactSvgRectangle } from "./tests-react-svg-export-image/react-svg-rectangle.js";

describe("react-svg-export-image", () => {
  [
    testReactSvgBinaryPng,
    testReactSvgBinaryUrl,
    testReactSvgBinary,
    testReactSvgCallback,
    testReactSvgDashedLine,
    testReactSvgEllipse,
    testReactSvgEmptyText,
    testReactSvgGroup,
    testReactSvgLine,
    testReactSvgPolygon,
    testReactSvgPolyline,
    testReactSvgRectangle,
    testReactSvgSubImage,
    testReactSvgBold,
    testReactSvgTextGrowthDirections,
    testReactSvgItalic,
    testReactSvgSub,
    testReactSvgText,
  ].forEach((item) => {
    test(item.name, () => {
      expect(JSON.stringify(item.abstractImage)).toEqual(item.expectedSerializedJsx);
    });
  });
});
