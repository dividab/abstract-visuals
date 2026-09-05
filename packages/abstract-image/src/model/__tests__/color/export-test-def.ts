/**
 * Defines a data-type that represents a single test for the Docx render function
 */

import type * as AbstractImage from "../../../../src/index.js";

export type ExportTestDef = {
  readonly name: string;
  readonly abstractColor: {} | AbstractImage.Color | undefined;
  readonly expectedColor: {} | undefined;
};
