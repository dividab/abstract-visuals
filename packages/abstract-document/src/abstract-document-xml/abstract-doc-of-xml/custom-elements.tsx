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
} from "../../abstract-document/index";

type StyleProps = {
  readonly ParagraphStyle: string;
  readonly TextStyle: string;
  readonly TableCellStyle: string;
  readonly TableStyle: string;
  readonly GroupStyle: string;
};

const stylePropsKeys: Record<string, boolean> = {
  ParagraphStyle: true,
  TextStyle: true,
  TableCellStyle: true,
  TableStyle: true,
  GroupStyle: true,
};

export function extractStyleNames(
  styleNames: string | undefined,
  styleNameTypes: Record<string, string>
): Partial<StyleProps> {
  const names = (styleNames || "").split(",");

  let styleNameProps = {};

  for (const name of names) {
    const trimmed = name.trim();
    const type = styleNameTypes[trimmed];
    if (type && stylePropsKeys[type]) {
      styleNameProps = { ...styleNameProps, [type]: trimmed };
    }
  }
  return styleNameProps;
}

export type TextRowProps = TextCellProps & {};

export function TextRow(props: TextRowProps, styleNameTypes: Record<string, string>): TableRow.TableRow {
  return TableRow.create({}, [TextCell(props, styleNameTypes)]);
}

export type TextCellProps = TextParagraphProps & {
  readonly columnSpan?: number;
  readonly rowSpan?: number;
  readonly cellStyle?: TableCellStyle.TableCellStyle;
  readonly styleNames?: string;
};

export function TextCell(props: TextCellProps, styleNameTypes: Record<string, string>): TableCell.TableCell {
  const { text, textStyle, paragraphStyle, cellStyle, columnSpan, rowSpan } = props;
  const styleNames = extractStyleNames(props.styleNames, styleNameTypes);
  const textRun = TextRun.create({ text, style: textStyle, styleName: styleNames.TextStyle });
  const paragraph = Paragraph.create({ style: paragraphStyle, styleName: styleNames.ParagraphStyle }, [textRun]);
  return TableCell.create({ columnSpan, rowSpan, style: cellStyle, styleName: styleNames.TableCellStyle }, [paragraph]);
}

export type TextParagraphProps = {
  readonly text: string;
  readonly textStyle?: TextStyle.TextStyle;
  readonly paragraphStyle?: ParagraphStyle.ParagraphStyle;
  readonly styleNames?: string;
};

export function TextParagraph(props: TextParagraphProps, styleNameTypes: Record<string, string>): Paragraph.Paragraph {
  const { text, textStyle, paragraphStyle } = props;
  const styleNames = extractStyleNames(props.styleNames, styleNameTypes);
  const textRun = TextRun.create({ text, style: textStyle, styleName: styleNames.TextStyle });
  return Paragraph.create({ style: paragraphStyle, styleName: styleNames.ParagraphStyle }, [textRun]);
}

export type ImageRowProps = ImageCellProps & {};

export function ImageRow(props: ImageCellProps, styleNameTypes: Record<string, string>): TableRow.TableRow {
  return TableRow.create({}, [ImageCell(props, styleNameTypes)]);
}

export type ImageCellProps = {
  readonly cellStyle?: TableCellStyle.TableCellStyle;
  readonly columnSpan?: number;
  readonly rowSpan?: number;
} & ImageParagraphProps;

export function ImageCell(props: ImageCellProps, styleNameTypes: Record<string, string>): TableCell.TableCell {
  const { image, width, height, paragraphStyle, cellStyle, columnSpan, rowSpan } = props;
  const styleNames = extractStyleNames(props.styleNames, styleNameTypes);
  const imageElement = image && Image.create({ imageResource: image, width, height });
  const paragraph =
    imageElement && Paragraph.create({ style: paragraphStyle, styleName: styleNames.ParagraphStyle }, [imageElement]);
  return TableCell.create(
    { columnSpan, rowSpan, style: cellStyle, styleName: styleNames.TableCellStyle },
    paragraph && [paragraph]
  );
}

export type ImageParagraphProps = {
  readonly image: ImageResource.ImageResource | undefined;
  readonly width: number;
  readonly height: number;
  readonly paragraphStyle?: ParagraphStyle.ParagraphStyle;
  readonly styleNames?: string;
};

export function ImageParagraph(
  props: ImageParagraphProps,
  styleNameTypes: Record<string, string>
): Paragraph.Paragraph | undefined {
  const { image, width, height, paragraphStyle } = props;
  const styleNames = extractStyleNames(props.styleNames, styleNameTypes);
  const imageElement = image && Image.create({ imageResource: image, width, height });
  const paragraph =
    imageElement && Paragraph.create({ style: paragraphStyle, styleName: styleNames.ParagraphStyle }, [imageElement]);
  return paragraph;
}
