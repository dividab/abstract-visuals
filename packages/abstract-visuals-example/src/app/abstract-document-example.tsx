/* eslint-disable @typescript-eslint/no-misused-promises */
import React from "react";
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import { AbstractDocJsx, AbstractDoc, AbstractDocPdf } from "../../../abstract-document/src/index.js";
import {
  createLine,
  createPoint,
  red,
  createDashStyle,
  createRectangle,
  blue,
  fromArgb,
  createAbstractImage as createAbstractImage_1,
  createSize,
  white,
} from "../../../abstract-image/src/index.js";

const header = [
  AbstractDocJsx.render(
    <AbstractDocJsx.Paragraph>
      <AbstractDocJsx.TextRun text="I am a header" />
      <AbstractDocJsx.TextField fieldType="PageNumber" />
      <AbstractDocJsx.TextRun text="/" />
      <AbstractDocJsx.TextField fieldType="TotalPages" />
    </AbstractDocJsx.Paragraph>
  ),
];

const footer = [
  AbstractDocJsx.render(
    <AbstractDocJsx.Paragraph>
      <AbstractDocJsx.TextRun text="I am a footer" />
    </AbstractDocJsx.Paragraph>
  ),
];

const cellstyleborders = AbstractDoc.TableCellStyle.create({
  borders: { left: 1, right: 1, top: 1, bottom: 1 },
  borderColors: AbstractDoc.LayoutFoundationColor.create({ top: "red", left: "red", right: "red", bottom: "red" }),
});
const headerstyle = AbstractDoc.TableCellStyle.create({
  background: "green",
  padding: { left: 2, right: 2, top: 2, bottom: 0 },
});

const cellstyle = AbstractDoc.TableCellStyle.create({
  background: "blue",
  padding: { left: 2, right: 2, top: 2, bottom: 0 },
});

const normalCellstyle = AbstractDoc.TableCellStyle.create({
  background: "white",
  padding: { left: 2, right: 2, top: 2, bottom: 2 },
  borders: { left: 1, right: 1, top: 1, bottom: 1 },
});

const cellStyleRightBorders = AbstractDoc.TableCellStyle.create({
  borders: { left: 1, right: 1, top: 1, bottom: 0 },
  borderColors: AbstractDoc.LayoutFoundationColor.create({ top: "red", left: "red", right: "red", bottom: "red" }),
  background: "blue",
  padding: { left: 2, right: 2, top: 2, bottom: 0 },
});
const cellStyleMiddleBorders = AbstractDoc.TableCellStyle.create({
  borders: { left: 1, right: 1, top: 1, bottom: 0 },
  borderColors: AbstractDoc.LayoutFoundationColor.create({ top: "red", left: "red", right: "red", bottom: "red" }),
  background: "blue",
  padding: { left: 2, right: 2, top: 2, bottom: 0 },
});
const cellStyleLeftBorders = AbstractDoc.TableCellStyle.create({
  borders: { left: 1, right: 1, top: 1, bottom: 0 },
  borderColors: AbstractDoc.LayoutFoundationColor.create({ top: "red", left: "red", right: "red", bottom: "red" }),
  background: "blue",
  padding: { left: 2, right: 2, top: 2, bottom: 0 },
});

const cellStyleWithBorders = AbstractDoc.TableCellStyle.create({
  borders: { left: 1, bottom: 1, right: 1, top: 1 },
  borderColors: AbstractDoc.LayoutFoundationColor.create({ top: "blue", left: "green", right: "white", bottom: "red" }),
  background: "white",
  padding: { left: 2, right: 2, top: 2, bottom: 0 },
});

const cellStyleNoBorders = AbstractDoc.TableCellStyle.create({
  background: "blue",
  padding: { left: 2, right: 2, top: 2, bottom: 0 },
});

const headerRows = [
  AbstractDocJsx.render(
    <AbstractDocJsx.TableRow>
      <AbstractDocJsx.TableCell style={headerstyle}>
        <AbstractDocJsx.Paragraph>
          <AbstractDocJsx.TextRun text="Header 1" style={{ type: "TextStyle" }} />
        </AbstractDocJsx.Paragraph>
      </AbstractDocJsx.TableCell>
      <AbstractDocJsx.TableCell style={headerstyle}>
        <AbstractDocJsx.Paragraph>
          <AbstractDocJsx.TextRun text="Header 2" style={{ type: "TextStyle" }} />
        </AbstractDocJsx.Paragraph>
      </AbstractDocJsx.TableCell>
      <AbstractDocJsx.TableCell style={headerstyle}>
        <AbstractDocJsx.Paragraph>
          <AbstractDocJsx.TextRun text="Header 3" style={{ type: "TextStyle" }} />
        </AbstractDocJsx.Paragraph>
      </AbstractDocJsx.TableCell>
    </AbstractDocJsx.TableRow>
  ),
  AbstractDocJsx.render(
    <AbstractDocJsx.TableRow>
      <AbstractDocJsx.TableCell style={headerstyle}>
        <AbstractDocJsx.Paragraph>
          <AbstractDocJsx.TextRun text="Header 4" style={{ type: "TextStyle" }} />
        </AbstractDocJsx.Paragraph>
      </AbstractDocJsx.TableCell>
      <AbstractDocJsx.TableCell style={headerstyle}>
        <AbstractDocJsx.Paragraph>
          <AbstractDocJsx.TextRun text="Header 5" style={{ type: "TextStyle" }} />
        </AbstractDocJsx.Paragraph>
      </AbstractDocJsx.TableCell>
      <AbstractDocJsx.TableCell style={headerstyle}>
        <AbstractDocJsx.Paragraph>
          <AbstractDocJsx.TextRun text="Header 6" style={{ type: "TextStyle" }} />
        </AbstractDocJsx.Paragraph>
      </AbstractDocJsx.TableCell>
    </AbstractDocJsx.TableRow>
  ),
];

export function AbstractDocumentExample(): React.JSX.Element {
  const page = AbstractDoc.MasterPage.create({
    header: header,
    footer: footer,
    style: {
      paperSize: "A4",
      headerMargins: AbstractDoc.LayoutFoundation.create(),
      footerMargins: AbstractDoc.LayoutFoundation.create(),
      contentMargins: AbstractDoc.LayoutFoundation.create(),
      orientation: "Portrait",
      noTopBottomMargin: false,
    },
  });

  const image = createAbstractImage();

  const doc = AbstractDocJsx.render(
    <AbstractDocJsx.AbstractDoc styles={{}}>
      <AbstractDocJsx.Section page={page}>
        <AbstractDocJsx.Paragraph>
          <AbstractDocJsx.HyperLink text="Go to chapter1" target="#chapter1" />
          <AbstractDocJsx.TocSeparator />
        </AbstractDocJsx.Paragraph>
        <AbstractDocJsx.Paragraph>
          <AbstractDocJsx.HyperLink text="Go to page 2" target="#page=2" />
          <AbstractDocJsx.TocSeparator />
        </AbstractDocJsx.Paragraph>

        <AbstractDocJsx.Table
          columnWidths={[100, 100, 100]}
          style={AbstractDoc.TableStyle.create({
            margins: AbstractDoc.LayoutFoundation.create({ top: 10, left: 10 }),
            cellStyle: cellstyleborders,
          })}
          headerRows={headerRows}
        >
          <AbstractDocJsx.TableRow>
            <AbstractDocJsx.TableCell style={cellstyle}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 1" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
            <AbstractDocJsx.TableCell style={cellstyle}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 2" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
            <AbstractDocJsx.TableCell style={cellstyle}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 3" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
          </AbstractDocJsx.TableRow>
          <AbstractDocJsx.TableRow>
            <AbstractDocJsx.TableCell style={cellstyle}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 4" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
            <AbstractDocJsx.TableCell style={cellstyle}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 5" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
            <AbstractDocJsx.TableCell style={cellstyle}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 6" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
          </AbstractDocJsx.TableRow>
        </AbstractDocJsx.Table>

        <AbstractDocJsx.Table
          columnWidths={[100]}
          style={AbstractDoc.TableStyle.create({ margins: AbstractDoc.LayoutFoundation.create({ top: 10, left: 10 }) })}
        >
          <AbstractDocJsx.TableRow>
            <AbstractDocJsx.TableCell style={cellstyle}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 1" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
          </AbstractDocJsx.TableRow>
        </AbstractDocJsx.Table>

        <AbstractDocJsx.Table
          columnWidths={[100, 100, 100]}
          style={AbstractDoc.TableStyle.create({ margins: AbstractDoc.LayoutFoundation.create({ top: 10, left: 10 }) })}
        >
          <AbstractDocJsx.TableRow>
            <AbstractDocJsx.TableCell style={cellStyleRightBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 1" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
            <AbstractDocJsx.TableCell style={cellStyleMiddleBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 2" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
            <AbstractDocJsx.TableCell style={cellStyleLeftBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 3" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
          </AbstractDocJsx.TableRow>
          <AbstractDocJsx.TableRow>
            <AbstractDocJsx.TableCell style={cellStyleRightBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 1" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
            <AbstractDocJsx.TableCell style={cellStyleMiddleBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 2" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
            <AbstractDocJsx.TableCell style={cellStyleLeftBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 3" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
          </AbstractDocJsx.TableRow>
          <AbstractDocJsx.TableRow>
            <AbstractDocJsx.TableCell style={cellStyleWithBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 4" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
            <AbstractDocJsx.TableCell style={cellStyleWithBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 5" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
            <AbstractDocJsx.TableCell style={cellStyleWithBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 6" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
          </AbstractDocJsx.TableRow>
          <AbstractDocJsx.TableRow>
            <AbstractDocJsx.TableCell style={cellStyleWithBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 7" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
            <AbstractDocJsx.TableCell style={cellStyleWithBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 8" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
            <AbstractDocJsx.TableCell style={cellStyleWithBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 9" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
          </AbstractDocJsx.TableRow>
        </AbstractDocJsx.Table>
        <AbstractDocJsx.Table
          columnWidths={[100, 100, 100]}
          style={AbstractDoc.TableStyle.create({ margins: AbstractDoc.LayoutFoundation.create({ top: 10, left: 10 }) })}
        >
          <AbstractDocJsx.TableRow>
            <AbstractDocJsx.TableCell style={cellStyleNoBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 4" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
            <AbstractDocJsx.TableCell style={cellStyleNoBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 5" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
            <AbstractDocJsx.TableCell style={cellStyleNoBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 6" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
          </AbstractDocJsx.TableRow>
          <AbstractDocJsx.TableRow>
            <AbstractDocJsx.TableCell style={cellStyleNoBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 7" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
            <AbstractDocJsx.TableCell style={cellStyleNoBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 8" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
            <AbstractDocJsx.TableCell style={cellStyleNoBorders}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Table cell 9" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
          </AbstractDocJsx.TableRow>
        </AbstractDocJsx.Table>
        <AbstractDocJsx.Table
          columnWidths={[150]}
          style={AbstractDoc.TableStyle.create({
            position: "absolute",
            margins: AbstractDoc.LayoutFoundation.create({ top: 100, left: 350 }),
          })}
        >
          <AbstractDocJsx.TableRow>
            <AbstractDocJsx.TableCell style={normalCellstyle}>
              <AbstractDocJsx.Paragraph>
                <AbstractDocJsx.TextRun text="Absolute positioned Table" />
              </AbstractDocJsx.Paragraph>
            </AbstractDocJsx.TableCell>
          </AbstractDocJsx.TableRow>
        </AbstractDocJsx.Table>
        <AbstractDocJsx.Group
          style={AbstractDoc.GroupStyle.create({
            position: "absolute",
            margins: AbstractDoc.LayoutFoundation.create({ top: 150, left: 350 }),
          })}
        >
          <AbstractDocJsx.Paragraph>
            <AbstractDocJsx.TextRun text="Absolute positioned Group" />
          </AbstractDocJsx.Paragraph>
        </AbstractDocJsx.Group>
        <AbstractDocJsx.Paragraph
          style={AbstractDoc.ParagraphStyle.create({
            position: "absolute",
            margins: AbstractDoc.LayoutFoundation.create({ top: 200, left: 350 }),
          })}
        >
          <AbstractDocJsx.TextRun text="Absolute positioned Paragraph" />
        </AbstractDocJsx.Paragraph>
      </AbstractDocJsx.Section>
      <AbstractDocJsx.Section page={page}>
        <AbstractDocJsx.Group>
          <AbstractDocJsx.Paragraph>
            <AbstractDocJsx.TextField fieldType="PageNumber" />
          </AbstractDocJsx.Paragraph>
          <AbstractDocJsx.Table columnWidths={[Infinity, Infinity, Infinity]}>
            <AbstractDocJsx.TableRow>
              <AbstractDocJsx.TableCell>
                <AbstractDocJsx.Paragraph>
                  <AbstractDocJsx.TextField fieldType="PageNumberOf" target="chapter1" />
                </AbstractDocJsx.Paragraph>
              </AbstractDocJsx.TableCell>
              <AbstractDocJsx.TableCell>
                <AbstractDocJsx.Paragraph>
                  <AbstractDocJsx.TextField fieldType="PageNumberOf" target="chapter2" />
                </AbstractDocJsx.Paragraph>
              </AbstractDocJsx.TableCell>
              <AbstractDocJsx.TableCell>
                <AbstractDocJsx.Paragraph>
                  <AbstractDocJsx.TextField fieldType="PageNumberOf" target="chapter3" />
                </AbstractDocJsx.Paragraph>
              </AbstractDocJsx.TableCell>
            </AbstractDocJsx.TableRow>
          </AbstractDocJsx.Table>
          <AbstractDocJsx.Paragraph>
            <AbstractDocJsx.TextRun text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Egestas congue quisque egestas diam in arcu cursus. A cras semper auctor neque vitae tempus quam pellentesque. In fermentum et sollicitudin ac orci. Scelerisque viverra mauris in aliquam. Nunc lobortis mattis aliquam faucibus. " />
            <AbstractDocJsx.TextRun
              text=" pretium quam vulputate. Tincidunt augue interdum velit euismod in."
              style={AbstractDoc.TextStyle.create({ color: "red", opacity: 0.2 })}
            />
            <AbstractDocJsx.TextRun text=" Nulla aliquet enim tortor at." />
            <AbstractDocJsx.TextRun
              text=" pretium quam vulputate. Tincidunt augue interdum velit euismod in."
              style={AbstractDoc.TextStyle.create({ color: "red" })}
            />
            <AbstractDocJsx.TextRun text=" Nulla aliquet enim tortor at." />
            <AbstractDocJsx.TextRun
              text=" pretium quam vulputate. Tincidunt augue interdum velit euismod in."
              style={AbstractDoc.TextStyle.create({ color: "red" })}
            />
            <AbstractDocJsx.TextRun text=" Nulla aliquet enim tortor at." />
            <AbstractDocJsx.TextRun
              text=" pretium quam vulputate. Tincidunt augue interdum velit euismod in."
              style={AbstractDoc.TextStyle.create({ color: "red" })}
            />
            <AbstractDocJsx.TextRun text=" Nulla aliquet enim tortor at." />
            <AbstractDocJsx.TextRun
              text=" pretium quam vulputate. Tincidunt augue interdum velit euismod in."
              style={AbstractDoc.TextStyle.create({ strike: true })}
            />
          </AbstractDocJsx.Paragraph>
          <AbstractDocJsx.Paragraph>
            <AbstractDocJsx.TextRun text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Egestas congue quisque egestas diam in arcu cursus. A cras semper auctor neque vitae tempus quam pellentesque. In fermentum et sollicitudin ac orci. Scelerisque viverra mauris in aliquam. Nunc lobortis mattis aliquam faucibus. " />
            <AbstractDocJsx.TextRun
              text="Amet venenatis urna cursus eget. Sed elementum tempus egestas sed sed risus pretium quam vulputate. Tincidunt augue interdum velit euismod in."
              style={AbstractDoc.TextStyle.create({ bold: true })}
            />
            <AbstractDocJsx.TextRun text=" Nibh tellus molestie nunc non blandit massa enim nec dui. Et ligula ullamcorper malesuada proin libero nunc consequat interdum. Nulla aliquet enim tortor at." />
          </AbstractDocJsx.Paragraph>
          <AbstractDocJsx.Paragraph style={AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
            <AbstractDocJsx.TextRun text="This" />
            <AbstractDocJsx.TextRun text=" is" style={AbstractDoc.TextStyle.create({ bold: true })} />
            <AbstractDocJsx.TextRun text=" centered" />
          </AbstractDocJsx.Paragraph>
          <AbstractDocJsx.Paragraph style={AbstractDoc.ParagraphStyle.create({ alignment: "End" })}>
            <AbstractDocJsx.TextRun text="This" />
            <AbstractDocJsx.TextRun text=" is" style={AbstractDoc.TextStyle.create({ bold: true })} />
            <AbstractDocJsx.TextRun text=" right aligned" />
          </AbstractDocJsx.Paragraph>

          <AbstractDocJsx.Paragraph style={AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
            <AbstractDocJsx.TextRun text=" " />
          </AbstractDocJsx.Paragraph>

          <AbstractDocJsx.Paragraph style={AbstractDoc.ParagraphStyle.create({ alignment: "Start" })}>
            <AbstractDocJsx.TextRun text="Some text before. " />
            <AbstractDocJsx.HyperLink text="This is a left aligned link" target="" />
            <AbstractDocJsx.TextRun text=" with some text after" />
          </AbstractDocJsx.Paragraph>
          <AbstractDocJsx.Paragraph style={AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
            <AbstractDocJsx.TextRun text=" " />
          </AbstractDocJsx.Paragraph>
          <AbstractDocJsx.Paragraph style={AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
            <AbstractDocJsx.HyperLink text="This is a centered link" target="" />
          </AbstractDocJsx.Paragraph>
          <AbstractDocJsx.Paragraph style={AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
            <AbstractDocJsx.TextRun text=" " />
          </AbstractDocJsx.Paragraph>
          <AbstractDocJsx.Paragraph style={AbstractDoc.ParagraphStyle.create({ alignment: "End" })}>
            <AbstractDocJsx.HyperLink text="This is a right aligned link" target="" />
          </AbstractDocJsx.Paragraph>
          <AbstractDocJsx.Paragraph style={AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
            <AbstractDocJsx.TextRun text=" " />
          </AbstractDocJsx.Paragraph>
          <AbstractDocJsx.Paragraph style={AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
            <AbstractDocJsx.TextRun text="This is a long text that is centered and should line break just fine. This is a long text that is centered and should line break just fine.  This is a long text that is centered and should line break just fine." />
          </AbstractDocJsx.Paragraph>
          <AbstractDocJsx.Paragraph style={AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
            <AbstractDocJsx.TextRun text=" " />
          </AbstractDocJsx.Paragraph>
          <AbstractDocJsx.Paragraph style={AbstractDoc.ParagraphStyle.create({ alignment: "End" })}>
            <AbstractDocJsx.TextRun text="This is a long text that is right aligned and should line break just fine. This is a long text that is right aligned and should line break just fine.  This is a long text that is right aligned and should line break just fine." />
          </AbstractDocJsx.Paragraph>
          <AbstractDocJsx.Paragraph style={AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
            <AbstractDocJsx.TextRun text=" " />
          </AbstractDocJsx.Paragraph>
        </AbstractDocJsx.Group>
      </AbstractDocJsx.Section>
      <AbstractDocJsx.Section page={page} id="chapter1">
        <AbstractDocJsx.Paragraph>
          <AbstractDocJsx.TextField fieldType="PageNumber" />
          <AbstractDocJsx.TextRun text=" / " />
          <AbstractDocJsx.TextField fieldType="TotalPages" />
        </AbstractDocJsx.Paragraph>
        <AbstractDocJsx.Paragraph>
          <AbstractDocJsx.TextRun text="Page1" />
        </AbstractDocJsx.Paragraph>
      </AbstractDocJsx.Section>
      <AbstractDocJsx.Section page={page} id="chapter2">
        <AbstractDocJsx.Paragraph>
          <AbstractDocJsx.TextField fieldType="PageNumber" />
          <AbstractDocJsx.TextRun text=" / " />
          <AbstractDocJsx.TextField fieldType="TotalPages" />
        </AbstractDocJsx.Paragraph>
        <AbstractDocJsx.PageBreak />
        <AbstractDocJsx.Paragraph>
          <AbstractDocJsx.TextRun text="A nice image" />
        </AbstractDocJsx.Paragraph>
        <AbstractDocJsx.Paragraph>
          <AbstractDocJsx.Image
            width={image.abstractImage.size.width}
            height={image.abstractImage.size.height}
            imageResource={image}
          />
        </AbstractDocJsx.Paragraph>
      </AbstractDocJsx.Section>
      <AbstractDocJsx.Section page={page} id="chapter3">
        <AbstractDocJsx.Paragraph>
          <AbstractDocJsx.TextField fieldType="PageNumber" />
          <AbstractDocJsx.TextRun text=" / " />
          <AbstractDocJsx.TextField fieldType="TotalPages" />
        </AbstractDocJsx.Paragraph>
        <AbstractDocJsx.Paragraph>
          <AbstractDocJsx.TextRun text="Page3" />
        </AbstractDocJsx.Paragraph>
      </AbstractDocJsx.Section>
    </AbstractDocJsx.AbstractDoc>
  );
  return (
    <div>
      <h1>Pdf</h1>
      <button onClick={() => generatePDF(doc)}>Generate PDF</button>
      <pre>{JSON.stringify(doc, undefined, 2)}</pre>
    </div>
  );
}

async function generatePDF(doc: AbstractDoc.AbstractDoc.AbstractDoc): Promise<void> {
  const blob: Blob = await AbstractDocPdf.exportToHTML5Blob(PDFDocument, doc);
  const objectURL = URL.createObjectURL(blob);
  window.open(objectURL);
}

function createAbstractImage(): AbstractDoc.ImageResource.ImageResource {
  const components = [
    createLine(createPoint(25, 125), createPoint(280, 125), red, 2, undefined, createDashStyle([10, 5])),
    createLine(createPoint(25, 100), createPoint(280, 100), red, 2, undefined, createDashStyle([10, 5], 5)),
    createRectangle(createPoint(10, 10), createPoint(300, 135), blue, 2, fromArgb(100, 0, 0, 0)),
  ];
  const image = createAbstractImage_1(createPoint(0, 0), createSize(300, 135), white, components);
  const imageResource = AbstractDoc.ImageResource.create({
    id: "test",
    abstractImage: image,
  });
  return imageResource;
}
