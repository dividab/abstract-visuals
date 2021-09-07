import path from "path";
import { loadTests, onlySkip } from "@abstract-visuals/test-utils";
import { ExportTestDef } from "./export-test-def";

export const tests = loadTests<ExportTestDef>(path.join(__dirname, "test-defs/"));

describe("dxf", () => {
  onlySkip(tests).forEach((item) => {
    test(item.name, async () => {
      expect(item.abstractImage).toEqual(item.expectedImage);
    });
  });
});
