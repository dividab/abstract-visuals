import * as AbstractImage from "../../../../../src/index.js";
import type { ExportTestDef } from "../export-test-def.js";

export const testColorUndefined: ExportTestDef = {
  name: "color undefined",
  abstractColor: AbstractImage.fromString("#fff"),
  expectedColor: undefined,
};
