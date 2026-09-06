import * as AbstractImage from "../../../../../src/index.js";
import type { ExportTestDef } from "../export-test-def.js";

export const testColorUndefined2: ExportTestDef = {
  name: "color undefined 2",
  abstractColor: AbstractImage.fromString("#########"),
  expectedColor: undefined,
};
