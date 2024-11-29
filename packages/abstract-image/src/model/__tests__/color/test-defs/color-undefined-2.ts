import { ExportTestDef } from "../export-test-def.js";
import * as AbstractImage from "../../../../../src/index.js";

export const testColorUndefined2: ExportTestDef = {
  name: "color undefined 2",
  abstractColor: AbstractImage.fromString("#########"),
  expectedColor: undefined,
};
