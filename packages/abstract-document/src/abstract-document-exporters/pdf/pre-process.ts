import { exhaustiveCheck } from "ts-exhaustive-check";
import * as AD from "../../abstract-document/index.js";
import * as TextStyle from "../../abstract-document/styles/text-style.js";

const alphabet = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const _numberingLevelItems = new Map<string, number>();

export function preProcess(doc: AD.AbstractDoc.AbstractDoc): AD.AbstractDoc.AbstractDoc {
  const children = doc.children.map((s) => preProcessSection(s, doc));
  return AD.AbstractDoc.create(
    {
      fonts: doc.fonts,
      styles: doc.styles,
      imageDataByUrl: doc.imageDataByUrl,
      // imageResources: doc.imageResources,
      // numberings: doc.numberings,
      // numberingDefinitions: doc.numberingDefinitions,
    },
    children
  );
}

function preProcessSection(s: AD.Section.Section, parentResources: AD.Resources.Resources): AD.Section.Section {
  const resources = AD.Resources.mergeResources([parentResources, s]);
  const header = s.page.header.flatMap((e) => preProcessSectionElement(e, resources));
  const footer = s.page.footer.flatMap((e) => preProcessSectionElement(e, resources));
  const page = AD.MasterPage.create({ style: s.page.style, header: header, footer: footer });
  const children = s.children.flatMap((e) => preProcessSectionElement(e, resources));
  return AD.Section.create({ page: page, id: s.id }, children);
}

function preProcessSectionElement(
  e: AD.SectionElement.SectionElement,
  parentResources: AD.Resources.Resources
): Array<AD.SectionElement.SectionElement> {
  const resources = AD.Resources.mergeResources([parentResources, e]);
  switch (e.type) {
    case "Paragraph":
      return preProcessParagraph(e, resources);
    case "Table":
      return [preProcessTable(e, resources)];
    case "Group":
      return preProcessGroup(e, resources);
    case "PageBreak":
      return [e];
    default:
      return exhaustiveCheck(e);
  }
}

function preProcessParagraph(
  paragraph: AD.Paragraph.Paragraph,
  resources: AD.Resources.Resources
): Array<AD.SectionElement.SectionElement> {
  const adjustedParagraphs = adjustParagraph(paragraph);
  if (paragraph.numbering === undefined || !resources.numberingDefinitions) {
    return adjustedParagraphs;
  }

  const numbering = paragraph.numbering.numberingId;
  const level = paragraph.numbering.level;
  const key = numbering + "_" + level.toString();
  const levelDefinitions = resources.numberingDefinitions[numbering]?.levels ?? [];
  let numberText = levelDefinitions[level]?.levelText ?? "";
  if (numbering === "Unordered") {
    numberText = "-";
  } else {
    for (let levelDefinition of levelDefinitions.filter((l) => l.level > level)) {
      _numberingLevelItems.delete(numbering + "_" + levelDefinition.level.toString());
    }

    const numberOverride = paragraph.numbering.numberOverride;
    const append = paragraph.numbering.append;
    if (numberOverride !== undefined) {
      _numberingLevelItems.set(key, numberOverride);
    } else if (!_numberingLevelItems.has(key)) {
      _numberingLevelItems.set(key, levelDefinitions[level].start);
    } else if (append !== true) {
      _numberingLevelItems.set(key, (_numberingLevelItems.get(key) || 0) + 1);
    }

    for (let levelDefinition of levelDefinitions.filter((l) => l.level <= level)) {
      const numberingLevel = numbering + "_" + levelDefinition.level.toString();
      const currentNumber = _numberingLevelItems.get(numberingLevel) || 0;
      const levelText = generateLevelText(levelDefinition.format, currentNumber);
      const levelKey = "%" + (levelDefinition.level + 1).toString();
      numberText = numberText.replace(levelKey, levelText);
    }
  }

  let rows: Array<AD.TableRow.TableRow> = [];
  let children: Array<AD.TableCell.TableCell> = [];

  children.push(AD.TableCell.create());

  const numberTextStyle = TextStyle.overrideWith(levelDefinitions[level]?.style, paragraph.style.textStyle);

  children.push(
    AD.TableCell.create({}, [
      AD.Paragraph.create(
        {
          styleName: paragraph.styleName,
        },
        [
          AD.TextRun.create({
            style: numberTextStyle,
            text: paragraph.numbering.append !== true ? numberText : "",
          }),
        ]
      ),
    ])
  );

  children.push(AD.TableCell.create({}, adjustedParagraphs));
  rows.push(AD.TableRow.create({}, children));

  const indentationWidth = levelDefinitions[level]?.levelIndention ?? 8;
  const numberingWidth = levelDefinitions[level]?.numberingWidth ?? 8;
  return [
    AD.Table.create(
      {
        style: AD.TableStyle.create({
          alignment: "Left",
          cellStyle: AD.TableCellStyle.create({ verticalAlignment: "Top" }),
        }),
        columnWidths: [indentationWidth - numberingWidth, numberingWidth, Infinity],
      },
      rows
    ),
  ];
}

function adjustParagraph(paragraph: AD.Paragraph.Paragraph): Array<AD.SectionElement.SectionElement> {
  return [paragraph];
  // let adjustedParagraphs: Array<AD.SectionElement.SectionElement> = [];
  // paragraph.children.forEach((a) => {
  //   switch (a.type) {
  //     case  "TextRun":
  //       const tr = preProcessTextRun(a, paragraph);
  //       adjustedParagraphs.push(tr);
  //       break;
  //       //FIXME: remove, we moved this section to when we "import" markdown into abstract doc instead of
  //       //       to when we export it.
  //     // case  "Markdown":
  //     //   const md = preProcessMarkdown(a); // this returns more paragraphs that we need
  //     //   adjustedParagraphs = adjustedParagraphs.concat(md);
  //     //   // md.forEach((mdparagraph) => {     // adjust so run them through ourselves once.
  //     //   //   console.log("***\n", JSON.stringify(mdparagraph), "\n");
  //     //   //   const mdproc = adjustParagraph(mdparagraph);
  //     //   //   console.log("===\n", JSON.stringify(mdproc), "\n");
  //     //   //   adjustedParagraphs = adjustedParagraphs.concat(mdproc)
  //     //   // })
  //     //   break;
  //     default:
  //       const children = [a];
  //       adjustedParagraphs.push(AD.Paragraph.create({
  //         styleName: paragraph.styleName,
  //         paragraphProperties: paragraph.paragraphProperties,
  //         textProperties: paragraph.textProperties,
  //         children,
  //         numbering: paragraph.numbering
  //       }));
  //       break;
  //   }
  // });

  // return adjustedParagraphs;
}
function generateLevelText(numberingFormat: AD.NumberingFormat.NumberingFormat, num: number): string {
  switch (numberingFormat) {
    case "Decimal":
      return num.toString();
    case "DecimalZero":
      return num > 9 ? num.toString() : "0" + num.toString();
    case "LowerLetter":
      return toChar(num - 1).toLowerCase();
    case "UpperLetter":
      return toChar(num - 1).toUpperCase();
    case "LowerRoman":
      return toRoman(num).toLowerCase();
    case "UpperRoman":
      return toRoman(num).toUpperCase();
    default:
      return exhaustiveCheck(numberingFormat);
  }
}

function toRoman(n: number): string {
  if (n < 0 || n > 3999) {
    throw new Error("number is out of range for Roman letters");
  } else if (n < 1) {
    return "";
  } else if (n >= 1000) {
    return "M" + toRoman(n - 1000);
  } else if (n >= 900) {
    return "CM" + toRoman(n - 900);
  } else if (n >= 500) {
    return "D" + toRoman(n - 500);
  } else if (n >= 400) {
    return "CD" + toRoman(n - 400);
  } else if (n >= 100) {
    return "C" + toRoman(n - 100);
  } else if (n >= 90) {
    return "XC" + toRoman(n - 90);
  } else if (n >= 50) {
    return "L" + toRoman(n - 50);
  } else if (n >= 40) {
    return "XL" + toRoman(n - 40);
  } else if (n >= 10) {
    return "X" + toRoman(n - 10);
  } else if (n >= 9) {
    return "IX" + toRoman(n - 9);
  } else if (n >= 5) {
    return "V" + toRoman(n - 5);
  } else if (n >= 4) {
    return "IV" + toRoman(n - 4);
  } else {
    return "I" + toRoman(n - 1);
  }
}

function toChar(num: number): string {
  let builder = "";
  do {
    const character = num % alphabet.length;
    builder = alphabet[character] + builder;
    num /= alphabet.length;
  } while (num > alphabet.length);
  return builder;
}

function preProcessTable(table: AD.Table.Table, resources: AD.Resources.Resources): AD.SectionElement.SectionElement {
  const processedHeaders = [];
  const processedChildren = [];
  let rowSpans: Map<number, AD.TableCell.TableCell> = new Map();
  if (table.headerRows) {
    for (const row of table.headerRows) {
      const header = preProcessTableRow(row, rowSpans, resources);
      processedHeaders.push(header);
    }
  }
  for (const row of table.children) {
    const children = preProcessTableRow(row, rowSpans, resources);
    processedChildren.push(children);
  }
  return AD.Table.create(
    {
      columnWidths: table.columnWidths,
      styleName: table.styleName,
      style: table.style,
      headerRows: processedHeaders,
    },
    processedChildren
  );
}

function preProcessTableRow(
  r: AD.TableRow.TableRow,
  rowSpans: Map<number, AD.TableCell.TableCell>,
  resources: AD.Resources.Resources
): AD.TableRow.TableRow {
  const processedChildren = [];
  let columnIndex = 0;
  for (const cell of r.children) {
    let dummyCell = rowSpans.get(columnIndex);
    while (dummyCell) {
      processedChildren.push(dummyCell);
      if (dummyCell.rowSpan <= 1) {
        rowSpans.delete(columnIndex);
      } else {
        rowSpans.set(columnIndex, { ...dummyCell, rowSpan: dummyCell.rowSpan - 1 });
      }
      columnIndex += dummyCell.columnSpan || 1;
      dummyCell = rowSpans.get(columnIndex);
    }

    const processedCell = preProcessTableCell(cell, resources);
    processedChildren.push(processedCell);
    if ((processedCell.rowSpan || 1) > 1) {
      rowSpans.set(columnIndex, { ...processedCell, children: [], rowSpan: processedCell.rowSpan - 1, dummy: true });
    }
    columnIndex += cell.columnSpan || 1;
  }

  // Make sure to reduce the rowSpanLeft of any cell that is at the end
  let dummyCell = rowSpans.get(columnIndex);
  while (dummyCell) {
    processedChildren.push(dummyCell);
    if (dummyCell.rowSpan <= 1) {
      rowSpans.delete(columnIndex);
    } else {
      rowSpans.set(columnIndex, { ...dummyCell, rowSpan: dummyCell.rowSpan - 1 });
    }
    columnIndex += dummyCell.columnSpan || 1;
    dummyCell = rowSpans.get(columnIndex);
  }

  return AD.TableRow.create({}, processedChildren);
}

function preProcessTableCell(c: AD.TableCell.TableCell, resources: AD.Resources.Resources): AD.TableCell.TableCell {
  const children = c.children.flatMap((e) => preProcessSectionElement(e, resources));
  return AD.TableCell.create(
    { styleName: c.styleName, columnSpan: c.columnSpan, rowSpan: c.rowSpan, style: c.style },
    children
  );
}

function preProcessGroup(
  group: AD.Group.Group,
  parentResources: AD.Resources.Resources
): Array<AD.SectionElement.SectionElement> {
  const children = group.children.flatMap((e) => preProcessSectionElement(e, parentResources));
  if (group.keepTogether || AD.Resources.hasResources(group) || group.style.position === "absolute") {
    return [
      AD.Group.create(
        {
          keepTogether: group.keepTogether,
          style: group.style,
          ...AD.Resources.extractResources(group),
        },
        children
      ),
    ];
  }
  return children;
}
