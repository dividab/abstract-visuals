import {
  TextStyle,
  ParagraphStyle,
  TableCellStyle,
  ImageResource,
  TextRun,
  Paragraph,
  TableCell,
  TableRow,
  Image,
} from "../abstract-document/index.js";
import { ADObject, StyleName } from "./abstract-doc-of-xml.js";

type StyleProps = {
  readonly ParagraphStyle: string;
  readonly TextStyle: string;
  readonly TableCellStyle: string;
  readonly TableStyle: string;
  readonly GroupStyle: string;
};

const StylePropKeys = ["ParagraphStyle", "TextStyle", "TableCellStyle", "TableStyle", "GroupStyle"];
const isOneofKey = (val: string): val is keyof StyleProps => StylePropKeys.includes(val);

export function extractStyleNames(styleNames: string | undefined, styleNameTypes: StyleName): Partial<StyleProps> {
  const names = (styleNames || "").split(",");

  let styleNameProps = {};

  for (const name of names) {
    const trimmed = name.trim();
    const type = styleNameTypes[trimmed];
    if (type && isOneofKey(type)) {
      styleNameProps = { ...styleNameProps, [type]: trimmed };
    }
  }

  return styleNameProps;
}

export type TextParagraphProps = {
  readonly text: string;
  readonly textStyle?: TextStyle.TextStyle;
  readonly paragraphStyle?: ParagraphStyle.ParagraphStyle;
  readonly styleNames?: string;
};

export function TextParagraph(props: TextParagraphProps, styleNameTypes: StyleName): ADObject {
  const { text, textStyle, paragraphStyle } = props;
  const styleNames = extractStyleNames(props.styleNames, styleNameTypes);

  const textRun = TextRun.create({ text, style: textStyle, styleName: styleNames.TextStyle });
  const paragraph = Paragraph.create({ style: paragraphStyle, styleName: styleNames.ParagraphStyle }, [textRun]);
  return paragraph;
}

export type TextCellProps = TextParagraphProps & {
  readonly columnSpan?: number;
  readonly rowSpan?: number;
  readonly cellStyle?: TableCellStyle.TableCellStyle;
  readonly styleNames?: string;
};

export function TextCell(props: TextCellProps, styleNameTypes: StyleName): ADObject {
  const { text, textStyle, paragraphStyle, cellStyle, columnSpan, rowSpan } = props;
  const styleNames = extractStyleNames(props.styleNames, styleNameTypes);

  const textRun = TextRun.create({ text, style: textStyle, styleName: styleNames.TextStyle });
  const paragraph = Paragraph.create({ style: paragraphStyle, styleName: styleNames.ParagraphStyle }, [textRun]);
  const tableCell = TableCell.create({ columnSpan, rowSpan, style: cellStyle, styleName: styleNames.TableCellStyle }, [
    paragraph,
  ]);
  return tableCell;
}

export type TextRowProps = TextCellProps & {};

export function TextRow(props: TextRowProps, styleNameTypes: StyleName): ADObject {
  const { text, textStyle, paragraphStyle, cellStyle, columnSpan, rowSpan } = props;
  const styleNames = extractStyleNames(props.styleNames, styleNameTypes);

  const textRun = TextRun.create({ text, style: textStyle, styleName: styleNames.TextStyle });
  const paragraph = Paragraph.create({ style: paragraphStyle, styleName: styleNames.ParagraphStyle }, [textRun]);
  const tableCell = TableCell.create({ columnSpan, rowSpan, style: cellStyle, styleName: styleNames.TableCellStyle }, [
    paragraph,
  ]);
  const tableRow = TableRow.create({}, [tableCell]);
  return tableRow;
}

export type ImageCellProps = {
  readonly image: ImageResource.ImageResource | undefined;
  readonly width: number;
  readonly height: number;
  readonly paragraphStyle?: ParagraphStyle.ParagraphStyle;
  readonly cellStyle?: TableCellStyle.TableCellStyle;
  readonly columnSpan?: number;
  readonly rowSpan?: number;
  readonly styleNames?: string;
};

export function ImageCell(props: ImageCellProps, styleNameTypes: StyleName): ADObject {
  const { image, width, height, paragraphStyle, cellStyle, columnSpan, rowSpan } = props;
  const styleNames = extractStyleNames(props.styleNames, styleNameTypes);

  const imageElement = image && Image.create({ imageResource: image, width, height });
  const paragraph =
    imageElement && Paragraph.create({ style: paragraphStyle, styleName: styleNames.ParagraphStyle }, [imageElement]);
  const tableCell = TableCell.create(
    { columnSpan, rowSpan, style: cellStyle, styleName: styleNames.TableCellStyle },
    paragraph && [paragraph]
  );
  return tableCell;
}
