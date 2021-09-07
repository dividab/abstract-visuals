import path from "path";
import { loadTests, onlySkip } from "@abstract-visuals/test-utils";
import { ExportTestDef } from "./export-test-def";

export const tests = loadTests<ExportTestDef>(path.join(__dirname, "test-defs/"));

describe("color", () => {
  onlySkip(tests).forEach((item) => {
    test(item.name, async () => {
      // const abstractDoc = render(item.abstractDocJsx);
      expect(item.abstractColor).toEqual(item.expectedColor);
    });
  });
});
