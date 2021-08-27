import React from "react";
import { ExportTestDef } from "../export-test-def";
import { Paragraph, AbstractDoc, Section } from "../../../../abstract-document-jsx";

export const test: ExportTestDef = {
  name: "simple test",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph></Paragraph>
      </Section>
    </AbstractDoc>
  ),
  expectedDocxZipContexts: {
    olle: "kalle",
  },
};
