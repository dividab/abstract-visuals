import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

export const test: ExportTestDef = {
  name: "color undefined 2",
  abstractColor: AbstractImage.fromString("#########"),
  expectedColor: undefined,
};
