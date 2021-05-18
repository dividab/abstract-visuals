import * as AD from "../../abstract-document";
import * as AI from "../../../../abstract-image";
// import * as BlobStream from "blob-stream";
import * as DOCXJS from "docx";
// import { preprocess } from "./pre-process";
// import * as HyperLinks from "./hyperlinks";
// import * as ADDOCXHelp from "./ad-to-docx-helper";
import { renderImage } from "./render-image";
import { Readable } from "stream";

const abstractDocToDocxFontRatio = 2;
const abstractDocPixelToDocxDXARatio = 20;

export function exportToHTML5Blob(doc: AD.AbstractDoc.AbstractDoc): Promise<Blob> {
  return new Promise((resolve) => {
    const docx = createDocument(doc);
    DOCXJS.Packer.toBlob(docx).then((blob) => {
      resolve(blob);
    });
  });
}

export function exportToStream(blobStream: NodeJS.WritableStream, doc: AD.AbstractDoc.AbstractDoc): void {
  const docx = createDocument(doc);

  DOCXJS.Packer.toBuffer(docx).then((buffer) => {
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(blobStream);
  });
}

/**
 * On the client side the stream can be a BlobStream from the blob-stream package.
 * On the server-side the stream can be a file stream from the fs package.
 * @param blobStream
 * @param doc
 */

function createDocument(doc: AD.AbstractDoc.AbstractDoc): DOCXJS.Document {
  //   const preprocessResult = preprocess(doc);

  const docx = new DOCXJS.Document({
    sections: doc.children.map((s) => renderSection(s, doc)),
  });

  for (let section of doc.children) {
    renderSection(section, doc);
  }
  return docx;
}

function renderSection(section: AD.Section.Section, parentResources: AD.Resources.Resources): DOCXJS.ISectionOptions {
  const resources = AD.Resources.mergeResources([parentResources, section]);

  return {
    properties: {
      page: {
        margin: {
          bottom: section.page.style.contentMargins.bottom * abstractDocPixelToDocxDXARatio,
          top: section.page.style.contentMargins.top * abstractDocPixelToDocxDXARatio,
          right: section.page.style.contentMargins.right * abstractDocPixelToDocxDXARatio,
          left: section.page.style.contentMargins.left * abstractDocPixelToDocxDXARatio,
        },
      },
    },
    headers: {
      default: new DOCXJS.Header({
        children: section.page.header.reduce((sofar, c) => {
          sofar.push(...renderSectionElement(c, resources));
          return sofar;
        }, [] as Array<DOCXJS.Paragraph | DOCXJS.Table>),
      }),
    },
    footers: {
      default: new DOCXJS.Footer({
        children: [
          ...section.page.footer.reduce((sofar, c) => {
            sofar.push(...renderSectionElement(c, resources));
            return sofar;
          }, [] as Array<DOCXJS.Paragraph | DOCXJS.Table>),
        ],
      }),
    },
    children: [
      ...section.children.reduce((sofar, c) => {
        sofar.push(...renderSectionElement(c, resources));
        return sofar;
      }, [] as Array<DOCXJS.Paragraph | DOCXJS.Table>),
    ],
  };
}

function renderSectionElement(
  element: AD.SectionElement.SectionElement,
  parentResources: AD.Resources.Resources
): ReadonlyArray<DOCXJS.Paragraph | DOCXJS.Table> /*| DOCXJS.TableOfContents | DOCXJS.HyperlinkRef */ {
  const resources = AD.Resources.mergeResources([parentResources, element]);
  switch (element.type) {
    case "Paragraph":
      return [renderParagraph(element, resources)];
    case "Group":
      return [...renderGroup(element, parentResources)];
    case "Table":
      return [renderTable(element, resources)];
    case "PageBreak":
      return [
        new DOCXJS.Paragraph({
          pageBreakBefore: true,
        }),
      ];
    default:
      return [new DOCXJS.Paragraph({})];
  }
}

function renderTable(table: AD.Table.Table, resources: AD.Resources.Resources): DOCXJS.Table {
  const style = AD.Resources.getStyle(
    undefined,
    table.style,
    "TableStyle",
    table.styleName,
    resources
  ) as AD.TableStyle.TableStyle;

  const fullWidth = table.columnWidths.some((c) => !Number.isFinite(c));
  const columnWidths = table.columnWidths.map((c) => c * abstractDocPixelToDocxDXARatio);
  return new DOCXJS.Table({
    alignment:
      style.alignment === "Left"
        ? DOCXJS.AlignmentType.LEFT
        : style.alignment === "Right"
        ? DOCXJS.AlignmentType.RIGHT
        : DOCXJS.AlignmentType.CENTER,
    margins: {
      top: style.margins.top * abstractDocPixelToDocxDXARatio,
      bottom: style.margins.bottom * abstractDocPixelToDocxDXARatio,
      left: style.margins.left * abstractDocPixelToDocxDXARatio,
      right: style.margins.right * abstractDocPixelToDocxDXARatio,
    },
    width: fullWidth
      ? {
          size: 100,
          type: DOCXJS.WidthType.PERCENTAGE,
        }
      : {
          type: DOCXJS.WidthType.DXA,
          size: columnWidths.reduce((a, b) => a + b),
        },
    borders: {
      top: {
        color: style.cellStyle.borderColor ?? "",
        size: 0,
        style: DOCXJS.BorderStyle.NONE,
      },
      right: {
        color: style.cellStyle.borderColor ?? "",
        size: 0,
        style: DOCXJS.BorderStyle.NONE,
      },
      bottom: {
        color: style.cellStyle.borderColor ?? "",
        size: 0,
        style: DOCXJS.BorderStyle.NONE,
      },
      left: {
        color: style.cellStyle.borderColor ?? "",
        size: 0,
        style: DOCXJS.BorderStyle.NONE,
      },
      insideHorizontal: {
        color: style.cellStyle.borderColor ?? "",
        size: 0,
        style: DOCXJS.BorderStyle.NONE,
      },
      insideVertical: {
        color: style.cellStyle.borderColor ?? "",
        size: 0,
        style: DOCXJS.BorderStyle.NONE,
      },
    },
    rows: table.children.map((c) => renderRow(c, resources, style.cellStyle, columnWidths)),
  });
}

function renderRow(
  row: AD.TableRow.TableRow,
  resources: AD.Resources.Resources,
  tableCellStyle: AD.TableCellStyle.TableCellStyle,
  columnWidths: ReadonlyArray<number>
): DOCXJS.TableRow {
  return new DOCXJS.TableRow({
    cantSplit: true,
    children: row.children.map((c, ix) => renderCell(c, resources, tableCellStyle, columnWidths[ix])),
  });
}

function renderCell(
  cell: AD.TableCell.TableCell,
  resources: AD.Resources.Resources,
  tableCellStyle: AD.TableCellStyle.TableCellStyle,
  width: number
): DOCXJS.TableCell {
  const style = AD.Resources.getStyle(
    tableCellStyle,
    cell.style,
    "TableCellStyle",
    cell.styleName,
    resources
  ) as AD.TableCellStyle.TableCellStyle;

  return new DOCXJS.TableCell({
    verticalAlign:
      (style.verticalAlignment && style.verticalAlignment === "Top"
        ? DOCXJS.VerticalAlign.TOP
        : style.verticalAlignment === "Bottom"
        ? DOCXJS.VerticalAlign.BOTTOM
        : DOCXJS.VerticalAlign.CENTER) || undefined,
    shading: {
      fill: style.background ? style.background : undefined,
    },
    columnSpan: cell.columnSpan,
    width: isFinite(width)
      ? {
          type: DOCXJS.WidthType.DXA,
          size: width,
        }
      : {
          type: DOCXJS.WidthType.AUTO,
          size: "",
        },
    margins: {
      top: Math.max(style.padding.top, 0) * abstractDocPixelToDocxDXARatio,
      bottom: Math.max(style.padding.bottom, 0) * abstractDocPixelToDocxDXARatio,
      left: Math.max(style.padding.left, 0) * abstractDocPixelToDocxDXARatio,
      right: Math.max(style.padding.right, 0) * abstractDocPixelToDocxDXARatio,
    },
    borders: {
      top: {
        color: style.borderColor ?? "",
        size: style.borders.top,
        style: style.borders.top ? DOCXJS.BorderStyle.SINGLE : DOCXJS.BorderStyle.NONE,
      },
      right: {
        color: style.borderColor ?? "",
        size: style.borders.right,
        style: style.borders.right ? DOCXJS.BorderStyle.SINGLE : DOCXJS.BorderStyle.NONE,
      },
      bottom: {
        color: style.borderColor ?? "",
        size: style.borders.bottom,
        style: style.borders.bottom ? DOCXJS.BorderStyle.SINGLE : DOCXJS.BorderStyle.NONE,
      },
      left: {
        color: style.borderColor ?? "",
        size: style.borders.left,
        style: style.borders.left ? DOCXJS.BorderStyle.SINGLE : DOCXJS.BorderStyle.NONE,
      },
    },

    children: cell.children.reduce((sofar, c) => {
      sofar.push(...renderSectionElement(c, resources));
      return sofar;
    }, [] as Array<DOCXJS.Paragraph | DOCXJS.Table>),
  });
}

function renderAtom(
  resources: AD.Resources.Resources,
  textStyle: AD.TextStyle.TextStyle,
  atom: AD.Atom.Atom
):
  | DOCXJS.TextRun
  | DOCXJS.ImageRun
  | DOCXJS.SymbolRun
  | DOCXJS.Bookmark
  | DOCXJS.PageBreak
  | DOCXJS.SequentialIdentifier
  | DOCXJS.FootnoteReferenceRun
  | DOCXJS.InsertedTextRun
  | DOCXJS.DeletedTextRun
  | DOCXJS.Math {
  switch (atom.type) {
    case "TextField":
      return renderTextField(resources, textStyle, atom);
    case "TextRun":
      return renderTextRun(resources, textStyle, atom);
    case "Image":
      return renderImage(atom, textStyle);
    case "HyperLink":
      return new DOCXJS.TextRun({ text: "" });
    default:
      return new DOCXJS.TextRun({ text: "missed" }); // TODO
  }
}

function renderTextField(
  resources: AD.Resources.Resources,
  textStyle: AD.TextStyle.TextStyle,
  textField: AD.TextField.TextField
): DOCXJS.TextRun {
  const style = AD.Resources.getStyle(
    textStyle,
    textField.style,
    "TextStyle",
    textField.styleName,
    resources
  ) as AD.TextStyle.TextStyle;
  switch (textField.fieldType) {
    case "Date":
      return renderText(style, new Date(Date.now()).toDateString());
    case "PageNumber":
      return renderPageNumber(style);
    default:
      return renderText(style, "");
  }
}

function renderTextRun(
  resources: AD.Resources.Resources,
  textStyle: AD.TextStyle.TextStyle,
  textRun: AD.TextRun.TextRun
): DOCXJS.TextRun {
  const style = AD.Resources.getNestedStyle(
    textStyle,
    textRun.style,
    "TextStyle",
    textRun.styleName,
    resources,
    textRun.nestedStyleNames || []
  ) as AD.TextStyle.TextStyle;

  return renderText(style, textRun.text);
}

function renderPageNumber(style: AD.TextStyle.TextStyle): DOCXJS.TextRun {
  const fontSize = AD.TextStyle.calculateFontSize(style, 10) * abstractDocToDocxFontRatio;
  return new DOCXJS.TextRun({
    font: "Arial",
    size: fontSize,
    color: style.color || "black",
    bold: style.bold,
    underline: style.underline
      ? {
          color: style.color,
          type: DOCXJS.UnderlineType.SINGLE,
        }
      : undefined,
    children: [DOCXJS.PageNumber.CURRENT],
  });
}

function renderText(style: AD.TextStyle.TextStyle, text: string): DOCXJS.TextRun {
  const fontSize = AD.TextStyle.calculateFontSize(style, 10) * abstractDocToDocxFontRatio;

  return new DOCXJS.TextRun({
    text: text,
    font: "Arial",
    size: fontSize,
    color: style.color || "black",
    bold: style.bold,
    underline: style.underline
      ? {
          color: style.color,
          type: DOCXJS.UnderlineType.SINGLE,
        }
      : undefined,
  });
}

function renderGroup(group: AD.Group.Group, resources: AD.Resources.Resources): Array<DOCXJS.Paragraph | DOCXJS.Table> {
  return group.children.reduce((sofar, c) => {
    sofar.push(...renderSectionElement(c, resources));
    return sofar;
  }, [] as Array<DOCXJS.Paragraph | DOCXJS.Table>);
}

function renderParagraph(paragraph: AD.Paragraph.Paragraph, resources: AD.Resources.Resources): DOCXJS.Paragraph {
  const style = AD.Resources.getStyle(
    undefined,
    paragraph.style,
    "ParagraphStyle",
    paragraph.styleName,
    resources
  ) as AD.ParagraphStyle.ParagraphStyle;

  return new DOCXJS.Paragraph({
    alignment:
      (style.alignment &&
        (style.alignment === "Center"
          ? DOCXJS.AlignmentType.CENTER
          : style.alignment === "End"
          ? DOCXJS.AlignmentType.END
          : DOCXJS.AlignmentType.START)) ||
      undefined,

    spacing: {
      before: Math.max(style.margins.top, 0) * abstractDocPixelToDocxDXARatio,
      after: Math.max(style.margins.bottom, 0) * abstractDocPixelToDocxDXARatio,
    },
    indent: {
      left: Math.max(style.margins.left, 0) * abstractDocPixelToDocxDXARatio,
      right: Math.max(style.margins.right, 0) * abstractDocPixelToDocxDXARatio,
    },
    children: paragraph.children.map((atom) => renderAtom(resources, style.textStyle, atom)),
  });
}
