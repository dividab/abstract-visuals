/**
 * Defines a data-type that represents a single test for the Docx render function
 */

import * as React from "react";

export type ExportTestDef = {
  readonly name: string;
  readonly only?: boolean;
  readonly skip?: boolean;
  readonly abstractImage: React.ReactElement<{}, string | React.JSXElementConstructor<any>>;
  readonly expectedSerializedJsx: string;
};
