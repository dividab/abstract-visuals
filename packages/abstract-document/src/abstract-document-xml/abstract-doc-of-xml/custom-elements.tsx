import { ImageProps } from "../../abstract-document/atoms/image.js";
import {
  TextStyle,
  ParagraphStyle,
  TableCellStyle,
  TextRun,
  Paragraph,
  TableCell,
  TableRow,
  Image,
  ImageResource,
} from "../../abstract-document/index.js";
import { ParagraphProps } from "../../abstract-document/section-elements/paragraph.js";
//dummy2

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

export type TextRowProps = Omit<TextCellProps, "style"> & { readonly cellStyle?: TableCellStyle.TableCellStyle };

export function TextRow(props: TextRowProps, styleNameTypes: Record<string, string>): TableRow.TableRow {
  return TableRow.create({}, [TextCell({ ...props, style: props.cellStyle }, styleNameTypes)]);
}

export type TextCellProps = Omit<TextParagraphProps, "style"> & {
  readonly columnSpan?: number;
  readonly rowSpan?: number;
  readonly style?: TableCellStyle.TableCellStyle;
  readonly paragraphStyle?: ParagraphStyle.ParagraphStyle;
  readonly styleNames?: string;
};

export function TextCell(props: TextCellProps, styleNameTypes: Record<string, string>): TableCell.TableCell {
  const { text, textStyle, paragraphStyle, style, columnSpan, rowSpan } = props;
  const styleNames = extractStyleNames(props.styleNames, styleNameTypes);
  const textRun = TextRun.create({
    text,
    style: textStyle ? { ...textStyle, type: "TextStyle" } : undefined,
    styleName: styleNames.TextStyle,
  });
  const paragraph = Paragraph.create(
    {
      style: paragraphStyle ? { ...paragraphStyle, type: "ParagraphStyle" } : undefined,
      styleName: styleNames.ParagraphStyle,
    },
    [textRun]
  );
  return TableCell.create({ columnSpan, rowSpan, style, styleName: styleNames.TableCellStyle }, [paragraph]);
}

export type TextParagraphProps = {
  readonly text: string;
  readonly style?: ParagraphStyle.ParagraphStyle;
  readonly textStyle?: TextStyle.TextStyle;
  readonly styleNames?: string;
};

export function TextParagraph(props: TextParagraphProps, styleNameTypes: Record<string, string>): Paragraph.Paragraph {
  const { text, textStyle, style } = props;
  const styleNames = extractStyleNames(props.styleNames, styleNameTypes);
  const textRun = TextRun.create({
    text,
    style: textStyle ? { ...textStyle, type: "TextStyle" } : undefined,
    styleName: styleNames.TextStyle,
  });
  return Paragraph.create({ style, styleName: styleNames.ParagraphStyle }, [textRun]);
}

export type ImageRowProps = Omit<ImageCellProps, "style"> & { readonly cellStyle?: TableCellStyle.TableCellStyle };

export function ImageRow(props: ImageRowProps, styleNameTypes: Record<string, string>): TableRow.TableRow {
  return TableRow.create({}, [ImageCell({ ...props, style: props.cellStyle }, styleNameTypes)]);
}

export type ImageCellProps = Omit<ImageParagraphProps, "style"> & {
  readonly style?: TableCellStyle.TableCellStyle;
  readonly paragraphStyle?: ParagraphStyle.ParagraphStyle;
  readonly columnSpan?: number;
  readonly rowSpan?: number;
};

export function ImageCell(props: ImageCellProps, styleNameTypes: Record<string, string>): TableCell.TableCell {
  const {
    imageResource,
    width,
    height,
    horizontalAlignment,
    verticalAlignment,
    paragraphStyle,
    style,
    columnSpan,
    rowSpan,
  } = props;
  const styleNames = extractStyleNames(props.styleNames, styleNameTypes);
  const imageElement =
    imageResource && Image.create({ imageResource, width, height, horizontalAlignment, verticalAlignment });
  const pararaphProps = {
    style: paragraphStyle ? { ...paragraphStyle, type: "ParagraphStyle" } : undefined,
    styleName: styleNames.ParagraphStyle,
  } as ParagraphProps;
  const paragraph = imageElement
    ? Paragraph.create(pararaphProps, [imageElement])
    : Paragraph.create(pararaphProps, [ImageMissing]);
  return TableCell.create({ columnSpan, rowSpan, style, styleName: styleNames.TableCellStyle }, [paragraph]);
}

export type ImageParagraphProps = ImageProps & {
  readonly style?: ParagraphStyle.ParagraphStyle;
  readonly styleNames?: string;
};

export function ImageParagraph(
  props: ImageParagraphProps,
  styleNameTypes: Record<string, string>
): Paragraph.Paragraph | undefined {
  const { imageResource, width, height, style, horizontalAlignment, verticalAlignment } = props;
  const styleNames = extractStyleNames(props.styleNames, styleNameTypes);
  const imageElement =
    imageResource && Image.create({ imageResource, width, height, horizontalAlignment, verticalAlignment });
  const pararaphProps = { style, styleName: styleNames.ParagraphStyle };
  return imageElement
    ? Paragraph.create(pararaphProps, [imageElement])
    : Paragraph.create(pararaphProps, [ImageMissing]);
}

const ImageMissing = TextRun.create({ text: "Image missing" });
