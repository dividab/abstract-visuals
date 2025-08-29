import * as AD from "../../abstract-document/index.js";
import {
  Packer,
  Document,
  ISectionOptions,
  Paragraph,
  Table,
  Bookmark,
  PageOrientation,
  Header,
  Footer,
  InternalHyperlink,
  ExternalHyperlink,
  TextRun,
  UnderlineType,
  AlignmentType,
  WidthType,
  BorderStyle,
  TableRow,
  TableCell,
  VerticalAlign,
  ImageRun,
  SymbolRun,
  PageBreak,
  SequentialIdentifier,
  FootnoteReferenceRun,
  InsertedTextRun,
  DeletedTextRun,
  Math as MathDocX,
  PageNumber,
} from "docx";
import { renderImage } from "./render-image.js";
import { Readable } from "stream";

const abstractDocToDocxFontRatio = 2;
const abstractDocPixelToDocxDXARatio = 20;

export function exportToHTML5Blob(
  doc: AD.AbstractDoc.AbstractDoc,
  imageDataByUrl: Record<string, Uint8Array | string> = {}
): Promise<Blob> {
  return new Promise((resolve) => {
    const docx = createDocument(doc, imageDataByUrl);
    Packer.toBlob(docx).then((blob) => {
      resolve(blob);
    });
  });
}

export function exportToStream(
  blobStream: NodeJS.WritableStream,
  doc: AD.AbstractDoc.AbstractDoc,
  imageDataByUrl: Record<string, Uint8Array | string> = {}
): void {
  const docx = createDocument(doc, imageDataByUrl);

  Packer.toBuffer(docx).then((buffer) => {
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

function createDocument(
  doc: AD.AbstractDoc.AbstractDoc,
  imageDataByUrl: Record<string, Uint8Array | string>
): Document {
  const docx = new Document({
    sections: doc.children.map((s) => renderSection(s, doc, imageDataByUrl)),
  });
  return docx;
}

function renderSection(
  section: AD.Section.Section,
  parentResources: AD.Resources.Resources,
  imageDataByUrl: Record<string, Uint8Array | string>
): ISectionOptions {
  const pageWidth = AD.PageStyle.getWidth(section.page.style);
  const pageHeight = AD.PageStyle.getHeight(section.page.style);

  const contentAvailableWidth =
    pageWidth - (section.page.style.contentMargins.left + section.page.style.contentMargins.right);

  const resources = AD.Resources.mergeResources([parentResources, section]);

  const headerChildren = section.page.header.reduce((sofar, c) => {
    sofar.push(...renderSectionElement(c, resources, contentAvailableWidth, false, imageDataByUrl));
    return sofar;
  }, [] as Array<Paragraph | Table>);

  const footerChildren = [
    ...section.page.footer.reduce((sofar, c) => {
      sofar.push(...renderSectionElement(c, resources, contentAvailableWidth, false, imageDataByUrl));
      return sofar;
    }, [] as Array<Paragraph | Table>),
  ];

  const contentChildren = [
    new Paragraph({
      spacing: { before: 0, after: 0, line: 1 },
      children: [
        new Bookmark({
          id: section.id,
          children: [],
        }),
      ],
    }),
    ...section.children.reduce((sofar, c) => {
      sofar.push(...renderSectionElement(c, resources, contentAvailableWidth, false, imageDataByUrl));
      return sofar;
    }, [] as Array<Paragraph | Table>),
  ];

  return {
    properties: {
      page: {
        size: {
          //DOC JS does the orientation after the width and height are set
          width: AD.PageStyle.getPaperWidth(section.page.style.paperSize) * abstractDocPixelToDocxDXARatio,
          height: AD.PageStyle.getPaperHeight(section.page.style.paperSize) * abstractDocPixelToDocxDXARatio,
          orientation:
            section.page.style.orientation === "Landscape" ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
        },
        margin: {
          bottom: section.page.style.contentMargins.bottom * abstractDocPixelToDocxDXARatio,
          top: section.page.style.contentMargins.top * abstractDocPixelToDocxDXARatio,
          right: section.page.style.contentMargins.right * abstractDocPixelToDocxDXARatio,
          left: section.page.style.contentMargins.left * abstractDocPixelToDocxDXARatio,
          header: section.page.style.headerMargins.top * abstractDocPixelToDocxDXARatio,
          footer: section.page.style.footerMargins.bottom * abstractDocPixelToDocxDXARatio,
        },
      },
    },
    headers: {
      default: new Header({
        children: headerChildren,
      }),
    },
    footers: {
      default: new Footer({
        children: footerChildren,
      }),
    },
    children: contentChildren,
  };
}

function renderHyperLink(
  hyperLink: AD.HyperLink.HyperLink,
  style: AD.TextStyle.TextStyle
): InternalHyperlink | ExternalHyperlink {
  const fontSize = AD.TextStyle.calculateFontSize(style, 10) * 2;
  const textRun = new TextRun({
    text: hyperLink.text,
    font: style.fontFamily || "Arial",
    size: fontSize,
    color: style.color || "blue",
    bold: style.bold || style.fontWeight === "bold",
    characterSpacing: style.characterSpacing,
    underline: style.underline
      ? {
          color: style.color || "blue",
          type: UnderlineType.SINGLE,
        }
      : undefined,
  });

  if (hyperLink.target.startsWith("#") && !hyperLink.target.startsWith("#page=")) {
    return new InternalHyperlink({
      anchor: hyperLink.target,
      child: textRun,
    });
  } else {
    return new ExternalHyperlink({
      link: hyperLink.target,
      child: textRun,
    });
  }
}

function renderSectionElement(
  element: AD.SectionElement.SectionElement,
  parentResources: AD.Resources.Resources,
  contentAvailableWidth: number,
  keepNext: boolean,
  imageDataByUrl: Record<string, Uint8Array | string>
): ReadonlyArray<Paragraph | Table> /*| DOCXJS.TableOfContents | DOCXJS.HyperlinkRef */ {
  const resources = AD.Resources.mergeResources([parentResources, element]);
  switch (element.type) {
    case "Paragraph":
      return [renderParagraph(element, resources, keepNext, imageDataByUrl)];
    case "Group":
      return [...renderGroup(element, parentResources, contentAvailableWidth, imageDataByUrl)];
    case "Table":
      const table = renderTable(element, resources, contentAvailableWidth, keepNext, imageDataByUrl);
      return table
        ? [table, new Paragraph({ keepNext: keepNext, children: [new TextRun({ text: ".", size: 0.000001 })] })]
        : [];
    case "PageBreak":
      return [
        new Paragraph({
          pageBreakBefore: true,
        }),
      ];
    default:
      return [new Paragraph({})];
  }
}

function renderTable(
  table: AD.Table.Table,
  resources: AD.Resources.Resources,
  contentAvailableWidth: number,
  keepNext: boolean,
  imageDataByUrl: Record<string, Uint8Array | string>
): Table | undefined {
  const style = AD.Resources.getStyle(
    undefined,
    table.style,
    "TableStyle",
    table.styleName,
    resources
  ) as AD.TableStyle.TableStyle;

  if (table.children.length === 0) {
    return undefined;
  }

  const tableWidthWithoutInfinity = table.columnWidths.reduce(
    (sofar, c) => (Number.isFinite(c) ? sofar + c : sofar),
    0
  );
  const amountOfInfinity = table.columnWidths.reduce((sofar, c) => (!Number.isFinite(c) ? sofar + 1 : sofar), 0);
  const infinityCellWidth = (contentAvailableWidth - tableWidthWithoutInfinity) / amountOfInfinity;
  const columnWidths = table.columnWidths.map((w) =>
    Number.isFinite(w) ? w * abstractDocPixelToDocxDXARatio : infinityCellWidth * abstractDocPixelToDocxDXARatio
  );

  return new Table({
    alignment:
      style.alignment === "Left"
        ? AlignmentType.LEFT
        : style.alignment === "Right"
        ? AlignmentType.RIGHT
        : AlignmentType.CENTER,
    margins: {
      top: style.margins.top * abstractDocPixelToDocxDXARatio,
      bottom: style.margins.bottom * abstractDocPixelToDocxDXARatio,
      left: style.margins.left * abstractDocPixelToDocxDXARatio,
      right: style.margins.right * abstractDocPixelToDocxDXARatio,
    },
    width: {
      type: WidthType.DXA,
      size: columnWidths.reduce((a, b) => a + b),
    },
    borders: {
      top: {
        color: style.cellStyle.borderColor ?? "",
        size: 0,
        style: BorderStyle.NONE,
      },
      right: {
        color: style.cellStyle.borderColor ?? "",
        size: 0,
        style: BorderStyle.NONE,
      },
      bottom: {
        color: style.cellStyle.borderColor ?? "",
        size: 0,
        style: BorderStyle.NONE,
      },
      left: {
        color: style.cellStyle.borderColor ?? "",
        size: 0,
        style: BorderStyle.NONE,
      },
      insideHorizontal: {
        color: style.cellStyle.borderColor ?? "",
        size: 0,
        style: BorderStyle.NONE,
      },
      insideVertical: {
        color: style.cellStyle.borderColor ?? "",
        size: 0,
        style: BorderStyle.NONE,
      },
    },
    rows: table.children.map((c) => renderRow(c, resources, style.cellStyle, columnWidths, keepNext, imageDataByUrl)),
  });
}

function renderRow(
  row: AD.TableRow.TableRow,
  resources: AD.Resources.Resources,
  tableCellStyle: AD.TableCellStyle.TableCellStyle,
  columnWidths: ReadonlyArray<number>,
  keepNext: boolean,
  imageDataByUrl: Record<string, Uint8Array | string>
): TableRow {
  return new TableRow({
    cantSplit: true,
    children: row.children.map((c, ix) =>
      renderCell(c, resources, tableCellStyle, columnWidths[ix], keepNext, imageDataByUrl)
    ),
  });
}

function renderCell(
  cell: AD.TableCell.TableCell,
  resources: AD.Resources.Resources,
  tableCellStyle: AD.TableCellStyle.TableCellStyle,
  width: number,
  keepNext: boolean,
  imageDataByUrl: Record<string, Uint8Array | string>
): TableCell {
  const style = AD.Resources.getStyle(
    tableCellStyle,
    cell.style,
    "TableCellStyle",
    cell.styleName,
    resources
  ) as AD.TableCellStyle.TableCellStyle;

  return new TableCell({
    verticalAlign:
      (style.verticalAlignment && style.verticalAlignment === "Top"
        ? VerticalAlign.TOP
        : style.verticalAlignment === "Bottom"
        ? VerticalAlign.BOTTOM
        : VerticalAlign.CENTER) || undefined,
    shading: {
      fill: style.background ? style.background : undefined,
    },
    columnSpan: cell.columnSpan,
    rowSpan: cell.rowSpan,
    width: {
      type: WidthType.DXA,
      size: width,
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
        style: style.borders.top ? BorderStyle.SINGLE : BorderStyle.NONE,
      },
      right: {
        color: style.borderColor ?? "",
        size: style.borders.right,
        style: style.borders.right ? BorderStyle.SINGLE : BorderStyle.NONE,
      },
      bottom: {
        color: style.borderColor ?? "",
        size: style.borders.bottom,
        style: style.borders.bottom ? BorderStyle.SINGLE : BorderStyle.NONE,
      },
      left: {
        color: style.borderColor ?? "",
        size: style.borders.left,
        style: style.borders.left ? BorderStyle.SINGLE : BorderStyle.NONE,
      },
    },

    children: cell.children.reduce((sofar, c) => {
      sofar.push(...renderSectionElement(c, resources, width, keepNext, imageDataByUrl));
      return sofar;
    }, [] as Array<Paragraph | Table>),
  });
}

function renderAtom(
  resources: AD.Resources.Resources,
  textStyle: AD.TextStyle.TextStyle,
  atom: AD.Atom.Atom,
  imageDataByUrl: Record<string, Uint8Array | string>
):
  | TextRun
  | ImageRun
  | SymbolRun
  | Bookmark
  | PageBreak
  | SequentialIdentifier
  | FootnoteReferenceRun
  | InsertedTextRun
  | DeletedTextRun
  | InternalHyperlink
  | ExternalHyperlink
  | MathDocX {
  switch (atom.type) {
    case "TextField":
      return renderTextField(resources, textStyle, atom);
    case "TextRun":
      return renderTextRun(resources, textStyle, atom);
    case "Image":
      return renderImage(atom, textStyle, imageDataByUrl);
    case "HyperLink":
      return renderHyperLink(atom, textStyle);
    case "TocSeparator":
      return new TextRun({ text: "..." });
    default:
      return new TextRun({ text: "missed" }); // TODO
  }
}

function renderTextField(
  resources: AD.Resources.Resources,
  textStyle: AD.TextStyle.TextStyle,
  textField: AD.TextField.TextField
): TextRun {
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
    case "TotalPages":
      return renderTotalPages(style);
    default:
      return renderText(style, "");
  }
}

function renderTextRun(
  resources: AD.Resources.Resources,
  textStyle: AD.TextStyle.TextStyle,
  textRun: AD.TextRun.TextRun
): TextRun {
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

function renderPageNumber(style: AD.TextStyle.TextStyle): TextRun {
  const fontSize = AD.TextStyle.calculateFontSize(style, 10) * abstractDocToDocxFontRatio;
  return new TextRun({
    font: style.fontFamily || "Arial",
    size: fontSize,
    color: style.color || "black",
    bold: style.bold || style.fontWeight === "bold",
    characterSpacing: style.characterSpacing,
    underline: style.underline
      ? {
          color: style.color,
          type: UnderlineType.SINGLE,
        }
      : undefined,
    children: [PageNumber.CURRENT],
  });
}

function renderTotalPages(style: AD.TextStyle.TextStyle): TextRun {
  const fontSize = AD.TextStyle.calculateFontSize(style, 10) * abstractDocToDocxFontRatio;
  return new TextRun({
    font: style.fontFamily || "Arial",
    size: fontSize,
    color: style.color || "black",
    bold: style.bold || style.fontWeight === "bold",
    characterSpacing: style.characterSpacing,
    underline: style.underline
      ? {
          color: style.color,
          type: UnderlineType.SINGLE,
        }
      : undefined,
    children: [PageNumber.TOTAL_PAGES],
  });
}

function renderText(style: AD.TextStyle.TextStyle, text: string): TextRun {
  const fontSize = AD.TextStyle.calculateFontSize(style, 10) * abstractDocToDocxFontRatio;

  return new TextRun({
    text: text,
    font: style.fontFamily || "Arial",
    size: fontSize,
    color: style.color || "black",
    bold: style.bold || style.fontWeight === "bold",
    characterSpacing: style.characterSpacing,
    underline: style.underline
      ? {
          color: style.color,
          type: UnderlineType.SINGLE,
        }
      : undefined,
  });
}

function renderGroup(
  group: AD.Group.Group,
  resources: AD.Resources.Resources,
  availabelWidth: number,
  imageDataByUrl: Record<string, Uint8Array | string>
): Array<Paragraph | Table> {
  let sofar = Array<Paragraph | Table>();
  let keepNext = true;
  for (let index = 0; index < group.children.length; index++) {
    if (index == group.children.length - 1) {
      keepNext = false;
    }
    sofar.push(...renderSectionElement(group.children[index], resources, availabelWidth, keepNext, imageDataByUrl));
  }
  return sofar;
}

function renderParagraph(
  paragraph: AD.Paragraph.Paragraph,
  resources: AD.Resources.Resources,
  keepNext: boolean,
  imageDataByUrl: Record<string, Uint8Array | string>
): Paragraph {
  const style = AD.Resources.getStyle(
    undefined,
    paragraph.style,
    "ParagraphStyle",
    paragraph.styleName,
    resources
  ) as AD.ParagraphStyle.ParagraphStyle;

  return new Paragraph({
    keepNext: keepNext,
    alignment:
      (style.alignment &&
        (style.alignment === "Center"
          ? AlignmentType.CENTER
          : style.alignment === "End"
          ? AlignmentType.END
          : AlignmentType.START)) ||
      undefined,

    spacing: {
      before: Math.max(style.margins.top, 0) * abstractDocPixelToDocxDXARatio,
      after: Math.max(style.margins.bottom, 0) * abstractDocPixelToDocxDXARatio,
    },
    indent: {
      left: Math.max(style.margins.left, 0) * abstractDocPixelToDocxDXARatio,
      right: Math.max(style.margins.right, 0) * abstractDocPixelToDocxDXARatio,
    },
    children: paragraph.children.map((atom) => renderAtom(resources, style.textStyle, atom, imageDataByUrl)),
  });
}
