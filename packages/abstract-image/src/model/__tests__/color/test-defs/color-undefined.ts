import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

export const test: ExportTestDef = {
  name: "color undefined",
  abstractColor: AbstractImage.fromString("#fff"),
  expectedColor: undefined,
};
