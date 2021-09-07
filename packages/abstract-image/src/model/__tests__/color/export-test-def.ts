/**
 * Defines a data-type that represents a single test for the Docx render function
 */

import * as AbstractImage from "../../../../src/index";

export type ExportTestDef = {
  readonly name: string;
  readonly only?: boolean;
  readonly skip?: boolean;
  readonly abstractColor: {} | AbstractImage.Color | undefined;
  readonly expectedColor: {} | undefined;
};
