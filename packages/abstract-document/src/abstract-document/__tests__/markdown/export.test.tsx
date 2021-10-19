import path from "path";
import { loadTests, onlySkip } from "@abstract-visuals/test-utils";
import { ExportTestDef } from "./export-test-def";
import { render } from "../../../abstract-document-jsx";

export const tests = loadTests<ExportTestDef>(path.join(__dirname, "test-defs/"));

describe("markdown", () => {
  onlySkip(tests).forEach((item) => {
    test(item.name, async () => {
      const abstractDoc = render(item.abstractDocJsx);
      expect(abstractDoc).toEqual(item.expectedMarkdown);
    });
  });
});
