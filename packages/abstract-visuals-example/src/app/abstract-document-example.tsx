import * as React from "react";
import * as AD from "../../../../packages/abstract-document/src";
import {
  AbstractDoc,
  Section,
  Paragraph,
  TextRun,
  TextField,
  HyperLink,
  Table,
  TableRow,
  TableCell,
  PageBreak,
  render,
  TocSeparator,
} from "../../../../packages/abstract-document/src/abstract-document-jsx";
import { AbstractDocExporters } from "../../../../packages/abstract-document/src";

const header = [
  render(
    <Paragraph>
      <TextRun text="I am a header" />
      <TextField fieldType="PageNumber" />
      <TextRun text="/" />
      <TextField fieldType="TotalPages" />
    </Paragraph>
  ),
];

const footer = [
  render(
    <Paragraph>
      <TextRun text="I am a footer" />
    </Paragraph>
  ),
];

export function AbstractDocumentExample(): JSX.Element {
  const page = AD.AbstractDoc.MasterPage.create({ header: header, footer: footer });
  const doc = render(
    <AbstractDoc>
      <Section page={page}>
        <Paragraph>
          <HyperLink text="Go to chapter1" target="#chapter1" />
          <TocSeparator />
        </Paragraph>
        <Paragraph>
          <HyperLink text="Go to page 2" target="#page=2" />
          <TocSeparator />
        </Paragraph>
      </Section>
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
        <Paragraph>
          <TextRun text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Egestas congue quisque egestas diam in arcu cursus. A cras semper auctor neque vitae tempus quam pellentesque. In fermentum et sollicitudin ac orci. Scelerisque viverra mauris in aliquam. Nunc lobortis mattis aliquam faucibus. " />
          <TextRun
            text=" pretium quam vulputate. Tincidunt augue interdum velit euismod in."
            style={AD.AbstractDoc.TextStyle.create({ color: "red" })}
          />
          <TextRun text=" Nulla aliquet enim tortor at." />
          <TextRun
            text=" pretium quam vulputate. Tincidunt augue interdum velit euismod in."
            style={AD.AbstractDoc.TextStyle.create({ color: "red" })}
          />
          <TextRun text=" Nulla aliquet enim tortor at." />
          <TextRun
            text=" pretium quam vulputate. Tincidunt augue interdum velit euismod in."
            style={AD.AbstractDoc.TextStyle.create({ color: "red" })}
          />
          <TextRun text=" Nulla aliquet enim tortor at." />
          <TextRun
            text=" pretium quam vulputate. Tincidunt augue interdum velit euismod in."
            style={AD.AbstractDoc.TextStyle.create({ color: "red" })}
          />
          <TextRun text=" Nulla aliquet enim tortor at." />
        </Paragraph>
        <Paragraph>
          <TextRun text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Egestas congue quisque egestas diam in arcu cursus. A cras semper auctor neque vitae tempus quam pellentesque. In fermentum et sollicitudin ac orci. Scelerisque viverra mauris in aliquam. Nunc lobortis mattis aliquam faucibus. " />
          <TextRun
            text="Amet venenatis urna cursus eget. Sed elementum tempus egestas sed sed risus pretium quam vulputate. Tincidunt augue interdum velit euismod in."
            style={AD.AbstractDoc.TextStyle.create({ bold: true })}
          />
          <TextRun text=" Nibh tellus molestie nunc non blandit massa enim nec dui. Et ligula ullamcorper malesuada proin libero nunc consequat interdum. Nulla aliquet enim tortor at." />
        </Paragraph>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
          <TextRun text="This" />
          <TextRun text=" is" style={AD.AbstractDoc.TextStyle.create({ bold: true })} />
          <TextRun text=" centered" />
        </Paragraph>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "End" })}>
          <TextRun text="This" />
          <TextRun text=" is" style={AD.AbstractDoc.TextStyle.create({ bold: true })} />
          <TextRun text=" right aligned" />
        </Paragraph>

        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
          <TextRun text=" " />
        </Paragraph>

        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "Start" })}>
          <TextRun text="Some text before. " />
          <HyperLink text="This is a left aligned link" target="" />
          <TextRun text=" with some text after" />
        </Paragraph>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
          <TextRun text=" " />
        </Paragraph>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
          <HyperLink text="This is a centered link" target="" />
        </Paragraph>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
          <TextRun text=" " />
        </Paragraph>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "End" })}>
          <HyperLink text="This is a right aligned link" target="" />
        </Paragraph>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
          <TextRun text=" " />
        </Paragraph>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
          <TextRun text="This is a long text that is centered and should line break just fine. This is a long text that is centered and should line break just fine.  This is a long text that is centered and should line break just fine." />
        </Paragraph>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
          <TextRun text=" " />
        </Paragraph>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "End" })}>
          <TextRun text="This is a long text that is right aligned and should line break just fine. This is a long text that is right aligned and should line break just fine.  This is a long text that is right aligned and should line break just fine." />
        </Paragraph>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
          <TextRun text=" " />
        </Paragraph>
      </Section>
      <Section page={page} id="chapter1">
        <Paragraph>
          <TextField fieldType="PageNumber" />
          <TextRun text=" / " />
          <TextField fieldType="TotalPages" />
        </Paragraph>
        <Paragraph>
          <TextRun text="Page1" />
        </Paragraph>
      </Section>
      <Section page={page} id="chapter2">
        <Paragraph>
          <TextField fieldType="PageNumber" />
          <TextRun text=" / " />
          <TextField fieldType="TotalPages" />
        </Paragraph>
        <PageBreak />
        <Paragraph>
          <TextRun text="Page2" />
        </Paragraph>
      </Section>
      <Section page={page} id="chapter3">
        <Paragraph>
          <TextField fieldType="PageNumber" />
          <TextRun text=" / " />
          <TextField fieldType="TotalPages" />
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

async function generatePDF(doc: AD.AbstractDoc.AbstractDoc.AbstractDoc): Promise<void> {
  // tslint:disable-next-line:no-require-imports
  const pdfKit = require("../pdfkit");
  const blob: Blob = await AbstractDocExporters.Pdf.exportToHTML5Blob(pdfKit, doc);
  const objectURL = URL.createObjectURL(blob);
  window.open(objectURL);
}
