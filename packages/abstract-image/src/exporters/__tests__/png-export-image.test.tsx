import { describe, test, expect } from "vitest";
import { testPngCreatePng } from "./tests-png-export-image/png-createPNG.js";

describe("png-export-image", () => {
  [testPngCreatePng].forEach((item) => {
    test(item.name, () => {
      expect(item.abstractImage).toEqual(item.expectedImage);
    });
  });
});
