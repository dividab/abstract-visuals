import * as React from "react";
import * as AD from "../../../../packages/abstract-document/src";
import {
  AbstractDoc,
  Section,
  Paragraph,
  TextRun,
  TextField,
  Table,
  TableRow,
  TableCell,
  render
} from "../../../../packages/abstract-document/src/abstract-document-jsx";
import { AbstractDocExporters } from "../../../../packages/abstract-document/src";

export function AbstractDocumentExample(): JSX.Element {
  const page = AD.AbstractDoc.MasterPage.create();
  const doc = render(
    <AbstractDoc>
      <Section page={page}>
        <Paragraph>
          <TextField fieldType="PageNumber" />
        </Paragraph>
        <Table columnWidths={[Infinity, Infinity, Infinity]}>
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextField fieldType="PageNumberOf" target="chapter1" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextField fieldType="PageNumberOf" target="chapter2" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextField fieldType="PageNumberOf" target="chapter3" />
              </Paragraph>
            </TableCell>
          </TableRow>
        </Table>
      </Section>
      <Section page={page} id="chapter1">
        <Paragraph>
          <TextField fieldType="PageNumber" />
        </Paragraph>
        <Paragraph>
          <TextRun text="Page1" />
        </Paragraph>
      </Section>
      <Section page={page} id="chapter2">
        <Paragraph>
          <TextField fieldType="PageNumber" />
        </Paragraph>
        <Paragraph>
          <TextRun text="Page2" />
        </Paragraph>
      </Section>
      <Section page={page} id="chapter3">
        <Paragraph>
          <TextField fieldType="PageNumber" />
        </Paragraph>
        <Paragraph>
          <TextRun text="Page3" />
        </Paragraph>
      </Section>
    </AbstractDoc>
  );

  return (
    <div>
      <h1>Pdf</h1>
      <button onClick={() => generatePDF(doc)}>Generate PDF</button>
      <pre>{JSON.stringify(doc, undefined, 2)}</pre>
    </div>
  );
}

async function generatePDF(
  doc: AD.AbstractDoc.AbstractDoc.AbstractDoc
): Promise<void> {
  // tslint:disable-next-line:no-require-imports
  const pdfKit = require("../pdfkit");
  const blob: Blob = await AbstractDocExporters.Pdf.exportToHTML5Blob(
    pdfKit,
    doc
  );
  const objectURL = URL.createObjectURL(blob);
  window.open(objectURL);
}
