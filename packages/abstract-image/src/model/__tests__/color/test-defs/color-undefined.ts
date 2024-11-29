import { ExportTestDef } from "../export-test-def.js";
import * as AbstractImage from "../../../../../src/index.js";

export const testColorUndefined: ExportTestDef = {
  name: "color undefined",
  abstractColor: AbstractImage.fromString("#fff"),
  expectedColor: undefined,
};
