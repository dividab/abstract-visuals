/**
 * Defines a data-type that represents a single test for the Docx render function
 */
export type ExportTestDef = {
  readonly name: string;
  readonly abstractDocJsx: React.JSX.Element;
  readonly expectedMarkdown: {};
};
