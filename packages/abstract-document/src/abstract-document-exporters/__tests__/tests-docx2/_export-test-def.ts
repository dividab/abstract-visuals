/**
 * Defines a data-type that represents a single test for the Docx render function
 */
export type ExportTestDef = {
  readonly name: string;
  readonly only?: boolean;
  readonly skip?: boolean;
  readonly abstractDocJsx: React.JSX.Element;
  readonly expectedDocxZipContexts: { readonly [filename: string]: string };
};
