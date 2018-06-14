import * as R from "ramda";
// import {ParagraphStyle, StyleKey, TableStyle, TextStyle, TableCellStyle, LayoutFoundation, Style} from "./index";
import * as LayoutFoundation from "./primitives/layout-foundation";
import * as ParagraphStyle from "./styles/paragraph-style";
import * as Style from "./styles/style";
import * as StyleKey from "./styles/style-key";
import * as TableCellStyle from "./styles/table-cell-style";
import * as TableStyle from "./styles/table-style";
import * as TextStyle from "./styles/text-style";
import { Indexer } from "./types";

export const defaultAndStandardStyles = createDefaultAndStandardStyles();

export function createDefaultAndStandardStyles(): Indexer<Style.Style> {
  return { ...createDefaultStyles(), ...createStandardStyles() };
}

export function createStandardStyles(): Indexer<Style.Style> {
  return createStyles([
    // Markdown styles START --> //
    [
      "H1",
      ParagraphStyle.create({
        textStyle: TextStyle.create({ bold: true, fontSize: 32 }),
        margins: LayoutFoundation.create({ top: 32 / 4, bottom: 32 / 16 })
      })
    ],
    [
      "H2",
      ParagraphStyle.create({
        textStyle: TextStyle.create({ bold: true, fontSize: 24 }),
        margins: LayoutFoundation.create({ top: 24 / 4, bottom: 24 / 16 })
      })
    ],
    [
      "H3",
      ParagraphStyle.create({
        textStyle: TextStyle.create({ bold: true, fontSize: 18 }),
        margins: LayoutFoundation.create({ top: 18 / 4, bottom: 18 / 16 })
      })
    ],
    [
      "H4",
      ParagraphStyle.create({
        textStyle: TextStyle.create({ bold: true, fontSize: 15 }),
        margins: LayoutFoundation.create({ top: 15 / 4, bottom: 15 / 16 })
      })
    ],
    [
      "H5",
      ParagraphStyle.create({
        textStyle: TextStyle.create({ bold: true, fontSize: 13 }),
        margins: LayoutFoundation.create({ top: 13 / 4, bottom: 13 / 16 })
      })
    ],
    [
      "H6",
      ParagraphStyle.create({
        textStyle: TextStyle.create({ bold: true, fontSize: 10 }),
        margins: LayoutFoundation.create({ top: 10 / 4, bottom: 10 / 16 })
      })
    ],
    ["Emphasis", TextStyle.create({ italic: true })],
    ["Strong", TextStyle.create({ bold: true })]
    // <-- Markdown styles END //
  ]);
}

function createStyles(
  tuples: Array<[string, Style.Style]>
): Indexer<Style.Style> {
  return R.fromPairs(
    tuples.map(
      s =>
        [StyleKey.create(s[1].type, s[0]), s[1]] as R.KeyValuePair<
          StyleKey.StyleKey,
          Style.Style
        >
    )
  );
}

export function createDefaultStyles(): Indexer<Style.Style> {
  const paragraphStyle = defaultParagraphStyle();
  const textStyle = defaultTextStyle();
  const tableStyle = defaultTableStyle();
  const tableCellStyle = defaultTableCellStyle();
  return {
    [StyleKey.create(paragraphStyle.type, "Default")]: paragraphStyle,
    [StyleKey.create(textStyle.type, "Default")]: textStyle,
    [StyleKey.create(tableStyle.type, "Default")]: tableStyle,
    [StyleKey.create(tableCellStyle.type, "Default")]: tableCellStyle
  };
}

function defaultParagraphStyle(): ParagraphStyle.ParagraphStyle {
  return ParagraphStyle.create({
    alignment: "Start",
    margins: LayoutFoundation.create({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }),
    textStyle: defaultTextStyle()
  });
}

function defaultTextStyle(): TextStyle.TextStyle {
  return TextStyle.create({
    fontFamily: "Helvetica",
    fontSize: 10,
    underline: false,
    bold: false,
    italic: false,
    subScript: false,
    superScript: false
  });
}

function defaultTableStyle(): TableStyle.TableStyle {
  return TableStyle.create({
    alignment: "Left"
  });
}

function defaultTableCellStyle(): TableCellStyle.TableCellStyle {
  return TableCellStyle.create({
    borders: LayoutFoundation.create({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }),
    padding: LayoutFoundation.create({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }),
    verticalAlignment: "Middle"
  });
}
