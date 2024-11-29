import { describe, test, expect } from "vitest";
import { testColorFromString } from "./test-defs/color-from-string.js";
import { testColorToString } from "./test-defs/color-to-string.js";
import { testColorUndefined2 } from "./test-defs/color-undefined-2.js";
import { testColorUndefined } from "./test-defs/color-undefined.js";

describe("color", () => {
  [testColorFromString, testColorToString, testColorUndefined2, testColorUndefined].forEach((item) => {
    test(item.name, () => {
      expect(item.abstractColor).toEqual(item.expectedColor);
    });
  });
});
