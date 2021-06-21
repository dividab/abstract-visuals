import * as AD from "../../abstract-document";
import * as DOCXJS from "docx";
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
  const docx = new DOCXJS.Document({
    sections: doc.children.map((s) => renderSection(s, doc)),
  });
  return docx;
}

function renderSection(section: AD.Section.Section, parentResources: AD.Resources.Resources): DOCXJS.ISectionOptions {
  const resources = AD.Resources.mergeResources([parentResources, section]);

  const headerChildren = section.page.header.reduce((sofar, c) => {
    sofar.push(...renderSectionElement(c, resources, 0, 0));
    return sofar;
  }, [] as Array<DOCXJS.Paragraph | DOCXJS.Table>);

  const footerChildren = [
    ...section.page.footer.reduce((sofar, c) => {
      sofar.push(
        ...renderSectionElement(
          c,
          resources,
          section.page.style.footerMargins.left,
          section.page.style.footerMargins.right
        )
      );
      return sofar;
    }, [] as Array<DOCXJS.Paragraph | DOCXJS.Table>),
  ];

  const contentChildren = [
    new DOCXJS.Paragraph({
      spacing: { before: 0, after: 0, line: 1 },
      children: [
        new DOCXJS.Bookmark({
          id: section.id,
          children: [],
        }),
      ],
    }),
    ...section.children.reduce((sofar, c) => {
      sofar.push(
        ...renderSectionElement(
          c,
          resources,
          section.page.style.contentMargins.left,
          section.page.style.contentMargins.right
        )
      );
      return sofar;
    }, [] as Array<DOCXJS.Paragraph | DOCXJS.Table>),
  ];

  return {
    properties: {
      page: {
        size: {
          orientation:
            section.page.style.orientation === "Landscape"
              ? DOCXJS.PageOrientation.LANDSCAPE
              : DOCXJS.PageOrientation.PORTRAIT,
        },
        margin: {
          bottom: section.page.style.contentMargins.bottom * abstractDocPixelToDocxDXARatio,
          top: section.page.style.contentMargins.top * abstractDocPixelToDocxDXARatio,
          right: 0,
          left: 0,
          header: section.page.style.headerMargins.top * abstractDocPixelToDocxDXARatio,
          footer: section.page.style.footerMargins.bottom * abstractDocPixelToDocxDXARatio,
        },
      },
    },
    headers: {
      default: new DOCXJS.Header({
        children: headerChildren,
      }),
    },
    footers: {
      default: new DOCXJS.Footer({
        children: footerChildren,
      }),
    },
    children: contentChildren,
  };
}

function renderHyperLink(
  hyperLink: AD.HyperLink.HyperLink,
  style: AD.TextStyle.TextStyle
): DOCXJS.InternalHyperlink | DOCXJS.ExternalHyperlink {
  const fontSize = AD.TextStyle.calculateFontSize(style, 10) * 2;
  const textRun = new DOCXJS.TextRun({
    text: hyperLink.text,
    font: "Arial",
    size: fontSize,
    color: style.color || "blue",
    bold: style.bold,
    underline: style.underline
      ? {
          color: style.color || "blue",
          type: DOCXJS.UnderlineType.SINGLE,
        }
      : undefined,
  });

  if (hyperLink.target.startsWith("#") && !hyperLink.target.startsWith("#page=")) {
    return new DOCXJS.InternalHyperlink({
      anchor: hyperLink.target,
      child: textRun,
    });
  } else {
    return new DOCXJS.ExternalHyperlink({
      link: hyperLink.target,
      child: textRun,
    });
  }
}

function renderSectionElement(
  element: AD.SectionElement.SectionElement,
  parentResources: AD.Resources.Resources,
  left: number,
  right: number
): ReadonlyArray<DOCXJS.Paragraph | DOCXJS.Table> /*| DOCXJS.TableOfContents | DOCXJS.HyperlinkRef */ {
  const resources = AD.Resources.mergeResources([parentResources, element]);
  switch (element.type) {
    case "Paragraph":
      return [renderParagraph(element, resources, left, right)];
    case "Group":
      return [...renderGroup(element, parentResources, left, right)];
    case "Table":
      return [renderTable(element, resources, left, right)];
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

function getTableColumns(table: AD.Table.Table): ReadonlyArray<string> {
  let i = [];
  for (const row of table.children) {
    for (const _cell of row.children) {
      i.push("");
    }
  }
  return i;
}

function getLengthOfFiniteColumns(table: AD.Table.Table): number {
  return (
    table.columnWidths.reduce((sofar, columnWidth) => {
      if (isFinite(columnWidth)) {
        sofar += columnWidth;
      }
      return sofar;
    }, 0) * abstractDocPixelToDocxDXARatio
  );
}

function abstractColumnWidthToDocxDxaWidth(table: AD.Table.Table, tableWidth: number): [Array<number>, boolean] {
  const numberOfColumns = getTableColumns(table);
  const lengthOfFiniteColumns = getLengthOfFiniteColumns(table);
  // All columns have infinite length, spreed them evenly where tableLength = 100%
  if (table.columnWidths.every((columnWidth) => !isFinite(columnWidth))) {
    return [numberOfColumns.map((_c) => tableWidth / numberOfColumns.length), true];
  } else if (table.columnWidths.find((columnWidth) => !isFinite(columnWidth))) {
    const spaceLeft = tableWidth - lengthOfFiniteColumns;
    const infiniteColumns = table.columnWidths.filter((columnWidth) => !isFinite(columnWidth));
    return [
      // One or more columns are infinite, but not all
      table.columnWidths.map((columnWidth) => {
        if (isFinite(columnWidth)) {
          return columnWidth * abstractDocPixelToDocxDXARatio;
        } else {
          return spaceLeft / infiniteColumns.length;
        }
      }),
      true,
    ];
  } else {
    // All columns have specific width, not one is infinite, we add one more cell the length of the remaining space
    return [
      [
        ...table.columnWidths.map((columnWidth) => columnWidth * abstractDocPixelToDocxDXARatio),
        tableWidth - lengthOfFiniteColumns,
      ],
      false,
    ];
  }
}

function renderTable(
  table: AD.Table.Table,
  resources: AD.Resources.Resources,
  left: number,
  right: number
): DOCXJS.Table {
  const style = AD.Resources.getStyle(
    undefined,
    table.style,
    "TableStyle",
    table.styleName,
    resources
  ) as AD.TableStyle.TableStyle;

  //Temporary workaround for margins/indent not working as expected on Table.
  //Waiting for a new version of docx to fix https://github.com/dolanmiu/docx/issues/801 for tables aswell
  //Indent will be added for tables which then can be used for a cleaner solution
  const docxPageWidthDxa = 11890;
  const totalWidth = docxPageWidthDxa - left * abstractDocPixelToDocxDXARatio - right * abstractDocPixelToDocxDXARatio;
  const [columnWidthsDxa, hasInfinite] = abstractColumnWidthToDocxDxaWidth(table, totalWidth);

  return new DOCXJS.Table({
    alignment: DOCXJS.AlignmentType.CENTER,

    width: {
      type: DOCXJS.WidthType.DXA,
      size: totalWidth,
    },
    layout: DOCXJS.TableLayoutType.FIXED,
    columnWidths: columnWidthsDxa,
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
    rows: table.children.map((c) => renderRow(c, resources, style.cellStyle, hasInfinite, table.style.alignment)),
  });
}

function renderRow(
  row: AD.TableRow.TableRow,
  resources: AD.Resources.Resources,
  tableCellStyle: AD.TableCellStyle.TableCellStyle,
  hasInfinite: boolean,
  alignment: AD.TableStyle.TableAlignment | undefined
): DOCXJS.TableRow {
  const children = row.children.map((c, ix) => renderCell(c, resources, tableCellStyle));
  const emptyColumn = new DOCXJS.TableCell({
    children: [new DOCXJS.Paragraph("")],
  });

  return new DOCXJS.TableRow({
    cantSplit: true,
    height: {
      value: 250,
      rule: DOCXJS.HeightRule.ATLEAST,
    },
    children: [
      ...(alignment === "Right" && !hasInfinite ? [emptyColumn] : []),
      ...children,
      ...(alignment === "Left" && !hasInfinite ? [emptyColumn] : []),
    ],
  });
}

function renderCell(
  cell: AD.TableCell.TableCell,
  resources: AD.Resources.Resources,
  tableCellStyle: AD.TableCellStyle.TableCellStyle
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
    margins: {
      top: Math.max(style.padding.top, 0) * abstractDocPixelToDocxDXARatio,
      bottom: Math.max(style.padding.bottom, 0) * abstractDocPixelToDocxDXARatio,
      left: Math.max(style.padding.left, 0) * abstractDocPixelToDocxDXARatio,
      right: Math.max(style.padding.right, 0) * abstractDocPixelToDocxDXARatio,
    },
    columnSpan: cell.columnSpan,
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
      sofar.push(...renderSectionElement(c, resources, 0, 0));
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
  | DOCXJS.InternalHyperlink
  | DOCXJS.ExternalHyperlink
  | DOCXJS.Math {
  switch (atom.type) {
    case "TextField":
      return renderTextField(resources, textStyle, atom);
    case "TextRun":
      return renderTextRun(resources, textStyle, atom);
    case "Image":
      return renderImage(atom, textStyle);
    case "HyperLink":
      return renderHyperLink(atom, textStyle);
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

function renderTotalPages(style: AD.TextStyle.TextStyle): DOCXJS.TextRun {
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
    children: [DOCXJS.PageNumber.TOTAL_PAGES],
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

function renderGroup(
  group: AD.Group.Group,
  resources: AD.Resources.Resources,
  left: number,
  right: number
): Array<DOCXJS.Paragraph | DOCXJS.Table> {
  return group.children.reduce((sofar, c) => {
    sofar.push(...renderSectionElement(c, resources, left, right));
    return sofar;
  }, [] as Array<DOCXJS.Paragraph | DOCXJS.Table>);
}

function renderParagraph(
  paragraph: AD.Paragraph.Paragraph,
  resources: AD.Resources.Resources,
  left: number,
  right: number
): DOCXJS.Paragraph {
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
      left: Math.max(style.margins.left, 0) * abstractDocPixelToDocxDXARatio + left * abstractDocPixelToDocxDXARatio,
      right: Math.max(style.margins.right, 0) * abstractDocPixelToDocxDXARatio + right * abstractDocPixelToDocxDXARatio,
    },
    children: paragraph.children.map((atom) => renderAtom(resources, style.textStyle, atom)),
  });
}
