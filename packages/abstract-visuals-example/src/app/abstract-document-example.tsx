/* eslint-disable @typescript-eslint/no-misused-promises */
import * as React from "react";
import {
  AbstractDoc as AD,
  AbstractDocExporters,
  AbstractDocJsx as ADJsx,
} from "../../../abstract-document/src/index.js";
import * as AI from "../../../abstract-image/src/index.js";

const header = [
  ADJsx.render(
    <ADJsx.Paragraph>
      <ADJsx.TextRun text="I am a header" />
      <ADJsx.TextField fieldType="PageNumber" />
      <ADJsx.TextRun text="/" />
      <ADJsx.TextField fieldType="TotalPages" />
    </ADJsx.Paragraph>
  ),
];

const footer = [
  ADJsx.render(
    <ADJsx.Paragraph>
      <ADJsx.TextRun text="I am a footer" />
    </ADJsx.Paragraph>
  ),
];

const cellstyleborders = AD.TableCellStyle.create({
  borders: { left: 1, right: 1, top: 1, bottom: 1 },
  borderColors: AD.LayoutFoundationColor.create({ top: "red", left: "red", right: "red", bottom: "red" }),
});
const headerstyle = AD.TableCellStyle.create({
  background: "green",
  padding: { left: 2, right: 2, top: 2, bottom: 0 },
});

const cellstyle = AD.TableCellStyle.create({
  background: "blue",
  padding: { left: 2, right: 2, top: 2, bottom: 0 },
});

const normalCellstyle = AD.TableCellStyle.create({
  background: "white",
  padding: { left: 2, right: 2, top: 2, bottom: 2 },
  borders: { left: 1, right: 1, top: 1, bottom: 1 },
});

const cellStyleRightBorders = AD.TableCellStyle.create({
  borders: { left: 1, right: 1, top: 1, bottom: 0 },
  borderColors: AD.LayoutFoundationColor.create({ top: "red", left: "red", right: "red", bottom: "red" }),
  background: "blue",
  padding: { left: 2, right: 2, top: 2, bottom: 0 },
});
const cellStyleMiddleBorders = AD.TableCellStyle.create({
  borders: { left: 1, right: 1, top: 1, bottom: 0 },
  borderColors: AD.LayoutFoundationColor.create({ top: "red", left: "red", right: "red", bottom: "red" }),
  background: "blue",
  padding: { left: 2, right: 2, top: 2, bottom: 0 },
});
const cellStyleLeftBorders = AD.TableCellStyle.create({
  borders: { left: 1, right: 1, top: 1, bottom: 0 },
  borderColors: AD.LayoutFoundationColor.create({ top: "red", left: "red", right: "red", bottom: "red" }),
  background: "blue",
  padding: { left: 2, right: 2, top: 2, bottom: 0 },
});

const cellStyleWithBorders = AD.TableCellStyle.create({
  borders: { left: 1, bottom: 1, right: 1, top: 1 },
  borderColors: AD.LayoutFoundationColor.create({ top: "blue", left: "green", right: "white", bottom: "red" }),
  background: "white",
  padding: { left: 2, right: 2, top: 2, bottom: 0 },
});

const cellStyleNoBorders = AD.TableCellStyle.create({
  background: "blue",
  padding: { left: 2, right: 2, top: 2, bottom: 0 },
});

const headerRows = [
  ADJsx.render(
    <ADJsx.TableRow>
      <ADJsx.TableCell style={headerstyle}>
        <ADJsx.Paragraph>
          <ADJsx.TextRun text="Header 1" style={{ type: "TextStyle" }} />
        </ADJsx.Paragraph>
      </ADJsx.TableCell>
      <ADJsx.TableCell style={headerstyle}>
        <ADJsx.Paragraph>
          <ADJsx.TextRun text="Header 2" style={{ type: "TextStyle" }} />
        </ADJsx.Paragraph>
      </ADJsx.TableCell>
      <ADJsx.TableCell style={headerstyle}>
        <ADJsx.Paragraph>
          <ADJsx.TextRun text="Header 3" style={{ type: "TextStyle" }} />
        </ADJsx.Paragraph>
      </ADJsx.TableCell>
    </ADJsx.TableRow>
  ),
  ADJsx.render(
    <ADJsx.TableRow>
      <ADJsx.TableCell style={headerstyle}>
        <ADJsx.Paragraph>
          <ADJsx.TextRun text="Header 4" style={{ type: "TextStyle" }} />
        </ADJsx.Paragraph>
      </ADJsx.TableCell>
      <ADJsx.TableCell style={headerstyle}>
        <ADJsx.Paragraph>
          <ADJsx.TextRun text="Header 5" style={{ type: "TextStyle" }} />
        </ADJsx.Paragraph>
      </ADJsx.TableCell>
      <ADJsx.TableCell style={headerstyle}>
        <ADJsx.Paragraph>
          <ADJsx.TextRun text="Header 6" style={{ type: "TextStyle" }} />
        </ADJsx.Paragraph>
      </ADJsx.TableCell>
    </ADJsx.TableRow>
  ),
];

export function AbstractDocumentExample(): React.JSX.Element {
  const page = AD.MasterPage.create({
    header: header,
    footer: footer,
    style: {
      paperSize: "A4",
      headerMargins: AD.LayoutFoundation.create(),
      footerMargins: AD.LayoutFoundation.create(),
      contentMargins: AD.LayoutFoundation.create(),
      orientation: "Portrait",
      noTopBottomMargin: false,
    },
  });

  const image = createAbstractImage();

  const doc = ADJsx.render(
    <ADJsx.AbstractDoc styles={{}}>
      <ADJsx.Section page={page}>
        <ADJsx.Paragraph>
          <ADJsx.HyperLink text="Go to chapter1" target="#chapter1" />
          <ADJsx.TocSeparator />
        </ADJsx.Paragraph>
        <ADJsx.Paragraph>
          <ADJsx.HyperLink text="Go to page 2" target="#page=2" />
          <ADJsx.TocSeparator />
        </ADJsx.Paragraph>

        <ADJsx.Table
          columnWidths={[100, 100, 100]}
          style={AD.TableStyle.create({
            margins: AD.LayoutFoundation.create({ top: 10, left: 10 }),
            cellStyle: cellstyleborders,
          })}
          headerRows={headerRows}
        >
          <ADJsx.TableRow>
            <ADJsx.TableCell style={cellstyle}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 1" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
            <ADJsx.TableCell style={cellstyle}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 2" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
            <ADJsx.TableCell style={cellstyle}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 3" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
          </ADJsx.TableRow>
          <ADJsx.TableRow>
            <ADJsx.TableCell style={cellstyle}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 4" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
            <ADJsx.TableCell style={cellstyle}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 5" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
            <ADJsx.TableCell style={cellstyle}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 6" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
          </ADJsx.TableRow>
        </ADJsx.Table>

        <ADJsx.Table
          columnWidths={[100]}
          style={AD.TableStyle.create({ margins: AD.LayoutFoundation.create({ top: 10, left: 10 }) })}
        >
          <ADJsx.TableRow>
            <ADJsx.TableCell style={cellstyle}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 1" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
          </ADJsx.TableRow>
        </ADJsx.Table>

        <ADJsx.Table
          columnWidths={[100, 100, 100]}
          style={AD.TableStyle.create({ margins: AD.LayoutFoundation.create({ top: 10, left: 10 }) })}
        >
          <ADJsx.TableRow>
            <ADJsx.TableCell style={cellStyleRightBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 1" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
            <ADJsx.TableCell style={cellStyleMiddleBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 2" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
            <ADJsx.TableCell style={cellStyleLeftBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 3" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
          </ADJsx.TableRow>
          <ADJsx.TableRow>
            <ADJsx.TableCell style={cellStyleRightBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 1" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
            <ADJsx.TableCell style={cellStyleMiddleBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 2" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
            <ADJsx.TableCell style={cellStyleLeftBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 3" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
          </ADJsx.TableRow>
          <ADJsx.TableRow>
            <ADJsx.TableCell style={cellStyleWithBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 4" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
            <ADJsx.TableCell style={cellStyleWithBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 5" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
            <ADJsx.TableCell style={cellStyleWithBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 6" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
          </ADJsx.TableRow>
          <ADJsx.TableRow>
            <ADJsx.TableCell style={cellStyleWithBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 7" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
            <ADJsx.TableCell style={cellStyleWithBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 8" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
            <ADJsx.TableCell style={cellStyleWithBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 9" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
          </ADJsx.TableRow>
        </ADJsx.Table>
        <ADJsx.Table
          columnWidths={[100, 100, 100]}
          style={AD.TableStyle.create({ margins: AD.LayoutFoundation.create({ top: 10, left: 10 }) })}
        >
          <ADJsx.TableRow>
            <ADJsx.TableCell style={cellStyleNoBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 4" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
            <ADJsx.TableCell style={cellStyleNoBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 5" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
            <ADJsx.TableCell style={cellStyleNoBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 6" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
          </ADJsx.TableRow>
          <ADJsx.TableRow>
            <ADJsx.TableCell style={cellStyleNoBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 7" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
            <ADJsx.TableCell style={cellStyleNoBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 8" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
            <ADJsx.TableCell style={cellStyleNoBorders}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Table cell 9" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
          </ADJsx.TableRow>
        </ADJsx.Table>
        <ADJsx.Table
          columnWidths={[150]}
          style={AD.TableStyle.create({
            position: "absolute",
            margins: AD.LayoutFoundation.create({ top: 100, left: 350 }),
          })}
        >
          <ADJsx.TableRow>
            <ADJsx.TableCell style={normalCellstyle}>
              <ADJsx.Paragraph>
                <ADJsx.TextRun text="Absolute positioned Table" />
              </ADJsx.Paragraph>
            </ADJsx.TableCell>
          </ADJsx.TableRow>
        </ADJsx.Table>
        <ADJsx.Group
          style={AD.GroupStyle.create({
            position: "absolute",
            margins: AD.LayoutFoundation.create({ top: 150, left: 350 }),
          })}
        >
          <ADJsx.Paragraph>
            <ADJsx.TextRun text="Absolute positioned Group" />
          </ADJsx.Paragraph>
        </ADJsx.Group>
        <ADJsx.Paragraph
          style={AD.ParagraphStyle.create({
            position: "absolute",
            margins: AD.LayoutFoundation.create({ top: 200, left: 350 }),
          })}
        >
          <ADJsx.TextRun text="Absolute positioned Paragraph" />
        </ADJsx.Paragraph>
      </ADJsx.Section>
      <ADJsx.Section page={page}>
        <ADJsx.Group>
          <ADJsx.Paragraph>
            <ADJsx.TextField fieldType="PageNumber" />
          </ADJsx.Paragraph>
          <ADJsx.Table columnWidths={[Infinity, Infinity, Infinity]}>
            <ADJsx.TableRow>
              <ADJsx.TableCell>
                <ADJsx.Paragraph>
                  <ADJsx.TextField fieldType="PageNumberOf" target="chapter1" />
                </ADJsx.Paragraph>
              </ADJsx.TableCell>
              <ADJsx.TableCell>
                <ADJsx.Paragraph>
                  <ADJsx.TextField fieldType="PageNumberOf" target="chapter2" />
                </ADJsx.Paragraph>
              </ADJsx.TableCell>
              <ADJsx.TableCell>
                <ADJsx.Paragraph>
                  <ADJsx.TextField fieldType="PageNumberOf" target="chapter3" />
                </ADJsx.Paragraph>
              </ADJsx.TableCell>
            </ADJsx.TableRow>
          </ADJsx.Table>
          <ADJsx.Paragraph>
            <ADJsx.TextRun text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Egestas congue quisque egestas diam in arcu cursus. A cras semper auctor neque vitae tempus quam pellentesque. In fermentum et sollicitudin ac orci. Scelerisque viverra mauris in aliquam. Nunc lobortis mattis aliquam faucibus. " />
            <ADJsx.TextRun
              text=" pretium quam vulputate. Tincidunt augue interdum velit euismod in."
              style={AD.TextStyle.create({ color: "red", opacity: 0.2 })}
            />
            <ADJsx.TextRun text=" Nulla aliquet enim tortor at." />
            <ADJsx.TextRun
              text=" pretium quam vulputate. Tincidunt augue interdum velit euismod in."
              style={AD.TextStyle.create({ color: "red" })}
            />
            <ADJsx.TextRun text=" Nulla aliquet enim tortor at." />
            <ADJsx.TextRun
              text=" pretium quam vulputate. Tincidunt augue interdum velit euismod in."
              style={AD.TextStyle.create({ color: "red" })}
            />
            <ADJsx.TextRun text=" Nulla aliquet enim tortor at." />
            <ADJsx.TextRun
              text=" pretium quam vulputate. Tincidunt augue interdum velit euismod in."
              style={AD.TextStyle.create({ color: "red" })}
            />
            <ADJsx.TextRun text=" Nulla aliquet enim tortor at." />
            <ADJsx.TextRun
              text=" pretium quam vulputate. Tincidunt augue interdum velit euismod in."
              style={AD.TextStyle.create({ strike: true })}
            />
          </ADJsx.Paragraph>
          <ADJsx.Paragraph>
            <ADJsx.TextRun text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Egestas congue quisque egestas diam in arcu cursus. A cras semper auctor neque vitae tempus quam pellentesque. In fermentum et sollicitudin ac orci. Scelerisque viverra mauris in aliquam. Nunc lobortis mattis aliquam faucibus. " />
            <ADJsx.TextRun
              text="Amet venenatis urna cursus eget. Sed elementum tempus egestas sed sed risus pretium quam vulputate. Tincidunt augue interdum velit euismod in."
              style={AD.TextStyle.create({ bold: true })}
            />
            <ADJsx.TextRun text=" Nibh tellus molestie nunc non blandit massa enim nec dui. Et ligula ullamcorper malesuada proin libero nunc consequat interdum. Nulla aliquet enim tortor at." />
          </ADJsx.Paragraph>
          <ADJsx.Paragraph style={AD.ParagraphStyle.create({ alignment: "Center" })}>
            <ADJsx.TextRun text="This" />
            <ADJsx.TextRun text=" is" style={AD.TextStyle.create({ bold: true })} />
            <ADJsx.TextRun text=" centered" />
          </ADJsx.Paragraph>
          <ADJsx.Paragraph style={AD.ParagraphStyle.create({ alignment: "End" })}>
            <ADJsx.TextRun text="This" />
            <ADJsx.TextRun text=" is" style={AD.TextStyle.create({ bold: true })} />
            <ADJsx.TextRun text=" right aligned" />
          </ADJsx.Paragraph>

          <ADJsx.Paragraph style={AD.ParagraphStyle.create({ alignment: "Center" })}>
            <ADJsx.TextRun text=" " />
          </ADJsx.Paragraph>

          <ADJsx.Paragraph style={AD.ParagraphStyle.create({ alignment: "Start" })}>
            <ADJsx.TextRun text="Some text before. " />
            <ADJsx.HyperLink text="This is a left aligned link" target="" />
            <ADJsx.TextRun text=" with some text after" />
          </ADJsx.Paragraph>
          <ADJsx.Paragraph style={AD.ParagraphStyle.create({ alignment: "Center" })}>
            <ADJsx.TextRun text=" " />
          </ADJsx.Paragraph>
          <ADJsx.Paragraph style={AD.ParagraphStyle.create({ alignment: "Center" })}>
            <ADJsx.HyperLink text="This is a centered link" target="" />
          </ADJsx.Paragraph>
          <ADJsx.Paragraph style={AD.ParagraphStyle.create({ alignment: "Center" })}>
            <ADJsx.TextRun text=" " />
          </ADJsx.Paragraph>
          <ADJsx.Paragraph style={AD.ParagraphStyle.create({ alignment: "End" })}>
            <ADJsx.HyperLink text="This is a right aligned link" target="" />
          </ADJsx.Paragraph>
          <ADJsx.Paragraph style={AD.ParagraphStyle.create({ alignment: "Center" })}>
            <ADJsx.TextRun text=" " />
          </ADJsx.Paragraph>
          <ADJsx.Paragraph style={AD.ParagraphStyle.create({ alignment: "Center" })}>
            <ADJsx.TextRun text="This is a long text that is centered and should line break just fine. This is a long text that is centered and should line break just fine.  This is a long text that is centered and should line break just fine." />
          </ADJsx.Paragraph>
          <ADJsx.Paragraph style={AD.ParagraphStyle.create({ alignment: "Center" })}>
            <ADJsx.TextRun text=" " />
          </ADJsx.Paragraph>
          <ADJsx.Paragraph style={AD.ParagraphStyle.create({ alignment: "End" })}>
            <ADJsx.TextRun text="This is a long text that is right aligned and should line break just fine. This is a long text that is right aligned and should line break just fine.  This is a long text that is right aligned and should line break just fine." />
          </ADJsx.Paragraph>
          <ADJsx.Paragraph style={AD.ParagraphStyle.create({ alignment: "Center" })}>
            <ADJsx.TextRun text=" " />
          </ADJsx.Paragraph>
        </ADJsx.Group>
      </ADJsx.Section>
      <ADJsx.Section page={page} id="chapter1">
        <ADJsx.Paragraph>
          <ADJsx.TextField fieldType="PageNumber" />
          <ADJsx.TextRun text=" / " />
          <ADJsx.TextField fieldType="TotalPages" />
        </ADJsx.Paragraph>
        <ADJsx.Paragraph>
          <ADJsx.TextRun text="Page1" />
        </ADJsx.Paragraph>
      </ADJsx.Section>
      <ADJsx.Section page={page} id="chapter2">
        <ADJsx.Paragraph>
          <ADJsx.TextField fieldType="PageNumber" />
          <ADJsx.TextRun text=" / " />
          <ADJsx.TextField fieldType="TotalPages" />
        </ADJsx.Paragraph>
        <ADJsx.PageBreak />
        <ADJsx.Paragraph>
          <ADJsx.TextRun text="A nice image" />
        </ADJsx.Paragraph>
        <ADJsx.Paragraph>
          <ADJsx.Image
            width={image.abstractImage.size.width}
            height={image.abstractImage.size.height}
            imageResource={image}
          />
        </ADJsx.Paragraph>
      </ADJsx.Section>
      <ADJsx.Section page={page} id="chapter3">
        <ADJsx.Paragraph>
          <ADJsx.TextField fieldType="PageNumber" />
          <ADJsx.TextRun text=" / " />
          <ADJsx.TextField fieldType="TotalPages" />
        </ADJsx.Paragraph>
        <ADJsx.Paragraph>
          <ADJsx.TextRun text="Page3" />
        </ADJsx.Paragraph>
      </ADJsx.Section>
    </ADJsx.AbstractDoc>
  );
  return (
    <div>
      <h1>Pdf</h1>
      <button onClick={() => generatePDF(doc)}>Generate PDF</button>
      <pre>{JSON.stringify(doc, undefined, 2)}</pre>
    </div>
  );
}

async function generatePDF(doc: AD.AbstractDoc.AbstractDoc): Promise<void> {
  const blob: Blob = await AbstractDocExporters.Pdf.exportToHTML5Blob((window as any).PDFDocument, doc);
  const objectURL = URL.createObjectURL(blob);
  window.open(objectURL);
}

function createAbstractImage(): AD.ImageResource.ImageResource {
  const components = [
    AI.createLine(AI.createPoint(25, 125), AI.createPoint(280, 125), AI.red, 2, undefined, AI.createDashStyle([10, 5])),
    AI.createLine(
      AI.createPoint(25, 100),
      AI.createPoint(280, 100),
      AI.red,
      2,
      undefined,
      AI.createDashStyle([10, 5], 5)
    ),
    AI.createRectangle(AI.createPoint(10, 10), AI.createPoint(300, 135), AI.blue, 2, AI.fromArgb(100, 0, 0, 0)),
  ];
  const image = AI.createAbstractImage(AI.createPoint(0, 0), AI.createSize(300, 135), AI.white, components);
  const imageResource = AD.ImageResource.create({
    id: "test",
    abstractImage: image,
  });
  return imageResource;
}
