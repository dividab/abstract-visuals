/* import * as React from "react";
import * as AD from "../../src/abstract-document";
import {AbstractDoc, Section, Paragraph, TextRun, render} from "../../src/abstract-document-jsx";
import {AbstractDocExporters} from "../../src/index"

export function AbstractDocumentExample() {
  const page = AD.MasterPage.create();
  const doc = render(
    <AbstractDoc>
      <Section page={page}>
        <Paragraph>
          <TextRun text="Test"/>
        </Paragraph>
        {["a", "b", "c"].map((c) => (
          <Paragraph key={c}>
            <TextRun text={c}/>
          </Paragraph>))}
        <Paragraph />
      </Section>
    </AbstractDoc>
  );

  return (
    <div>
      <h1>Pdf</h1>
      <button onClick={()=> generatePDF(doc)}>Generate PDF</button>
      <pre>
        {JSON.stringify(doc, undefined, 2)}
      </pre>
    </div>);
}

async function generatePDF(doc: AD.AbstractDoc.AbstractDoc) {
  const pdfKit = require("../pdfkit");
  const blob: Blob = await AbstractDocExporters.Pdf.exportToHTML5Blob(pdfKit, doc);
  const objectURL = URL.createObjectURL(blob);
  window.open(objectURL);
}
 */
