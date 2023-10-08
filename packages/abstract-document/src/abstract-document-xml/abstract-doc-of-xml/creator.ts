import { propIs } from "ramda";
import { ImageProps } from "../../abstract-document/atoms/image";
import {
  AbstractDoc,
  Atom,
  DefaultStyles,
  Font,
  Group,
  Image,
  Markdown,
  PageBreak,
  Paragraph,
  Section,
  SectionElement,
  Table,
  TableCell,
  TableRow,
  TextField,
  TextRun,
  TocSeparator,
  Types,
  ImageResource as ADImageResource,
  TextStyle,
} from "../../abstract-document/index";
import {
  TextRowProps,
  TextRow,
  TextCellProps,
  TextCell,
  TextParagraphProps,
  TextParagraph,
  ImageCellProps,
  ImageCell,
  ImageParagraphProps,
  ImageRowProps,
  ImageParagraph,
  ImageRow,
} from "./custom-elements";

export type ADCreatorFn = (props?: Record<string, unknown>, children?: ReadonlyArray<unknown>) => unknown;

export type ImageResource = ADImageResource.ImageResource & { readonly width?: number; readonly height?: number };

export type TextRunProps = {
  readonly text: string;
  readonly styleName?: string;
  readonly style?: TextStyle.TextStyle;
};

export const creators: (
  images: Record<string, ImageResource>,
  fonts: Types.Indexer<Font.Font>,
  styleNames: Record<string, string>
) => Record<string, ADCreatorFn> = (images, fonts, styleNames) => {
  return {
    AbstractDoc: (props, children: ReadonlyArray<Section.Section>) => {
      if (props) {
        props.fonts = fonts ?? undefined;
      }
      return AbstractDoc.create(props, children);
    },
    Section: (props, children: ReadonlyArray<SectionElement.SectionElement>) => Section.create(props, children),
    Paragraph: (props, children: ReadonlyArray<Atom.Atom>) => Paragraph.create(props, children),
    TextRow: (props: TextRowProps) => TextRow(props, styleNames),
    TextCell: (props: TextCellProps) => TextCell(props, styleNames),
    TextParagraph: (props: TextParagraphProps) => TextParagraph(props, styleNames),
    TextRun: (props) => TextRun.create(props as unknown as TextRun.TextRunProps),
    ImageRow: (props: ImageRowProps) => ImageRow(imageProps(images, props) as unknown as ImageRowProps, styleNames),
    ImageCell: (props: ImageCellProps) => ImageCell(imageProps(images, props) as unknown as ImageCellProps, styleNames),
    ImageParagraph: (props: ImageParagraphProps) =>
      ImageParagraph(imageProps(images, props) as unknown as ImageParagraphProps, styleNames),
    Image: (props: Record<string, unknown>) => Image.create(imageProps(images, props)),
    Table: (props, children: ReadonlyArray<TableRow.TableRow>) =>
      Table.create(props as unknown as Table.TableProps, children),
    TableRow: (props, children: ReadonlyArray<TableCell.TableCell>) => TableRow.create(props, children),
    TableCell: (props, children: ReadonlyArray<SectionElement.SectionElement>) => TableCell.create(props, children),
    TextField: (props) => TextField.create(props as unknown as TextField.TextFieldProps),
    Group: (props, children) => Group.create(props, children as ReadonlyArray<Group.Group>),
    PageBreak: () => PageBreak.create(),
    Markdown: (props) => Markdown.create(props as unknown as Markdown.MarkdownProps),
    TocSeparator: (props) => TocSeparator.create(props as TocSeparator.TocSeparatorProps),
  };
};

export const propsCreators: Record<string, ADCreatorFn> = {
  styles: (props: {
    readonly styles: Record<string, Record<string, string | number> & { readonly type: string }>;
  }): unknown => {
    const fixedStyles: Record<string, Record<string, string | number>> = {};
    if (props.styles) {
      Object.keys(props.styles).forEach((key: string) => {
        const styleObj = props.styles[key];
        fixedStyles[((styleObj ? styleObj.type : "") + "_" + key) as string] = { ...props.styles[key] };
      });
    }

    return { ...fixedStyles, ...DefaultStyles.createStandardStyles() };
  },
  columnWidths: (props: { readonly columnWidths: string; readonly columnMultiplier: string }): unknown => {
    const columnWidths = props.columnWidths
      .toString()
      .split(",")
      .map((item: string) => {
        const number = Number(item);
        return number === 0 || Number.isNaN(number) ? Infinity : number;
      });
    if (props.columnMultiplier) {
      return columnWidths.map((l) => l * Number(props.columnMultiplier));
    }
    return columnWidths;
  },
  borders: (props: { readonly borders: string }): unknown => {
    const borders: { [k: string]: number } = { top: 0, right: 0, bottom: 0, left: 0 };
    const propBorders = props.borders.toString().split(" ");
    if (!propBorders) {
      return borders;
    }

    if (propBorders.length === 1) {
      borders.top = Number(propBorders[0]);
      borders.right = Number(propBorders[0]);
      borders.bottom = Number(propBorders[0]);
      borders.left = Number(propBorders[0]);
      return borders;
    }

    propBorders.forEach((item: string, index) => {
      switch (index) {
        case 1:
          borders.top = Number(propBorders[0]);
          borders.right = Number(item);
          borders.bottom = Number(propBorders[0]);
          borders.left = Number(item);
          break;
        case 2:
          borders.top = Number(propBorders[0]);
          borders.right = Number(propBorders[1]);
          borders.bottom = Number(item);
          borders.left = Number(propBorders[1]);
          break;
        case 3:
          borders.top = Number(propBorders[0]);
          borders.right = Number(propBorders[1]);
          borders.bottom = Number(propBorders[2]);
          borders.left = Number(item);
          break;
        default:
          break;
      }
    });
    return borders;
  },
  padding: (props: { readonly padding: string }): unknown => {
    const padding: { [k: string]: number } = { top: 0, right: 0, bottom: 0, left: 0 };

    const paddings = props.padding.toString().split(" ");
    if (!paddings) {
      return padding;
    }

    if (paddings.length === 1) {
      padding.top = Number(paddings[0]);
      padding.right = Number(paddings[0]);
      padding.bottom = Number(paddings[0]);
      padding.left = Number(paddings[0]);
      return padding;
    }

    paddings.forEach((item: string, index) => {
      switch (index) {
        case 1:
          padding.top = Number(paddings[0]);
          padding.right = Number(item);
          padding.bottom = Number(paddings[0]);
          padding.left = Number(item);
          break;
        case 2:
          padding.top = Number(paddings[0]);
          padding.right = Number(paddings[1]);
          padding.bottom = Number(item);
          padding.left = Number(paddings[1]);
          break;
        case 3:
          padding.top = Number(paddings[0]);
          padding.right = Number(paddings[1]);
          padding.bottom = Number(paddings[2]);
          padding.left = Number(item);
          break;
        default:
          break;
      }
    });
    return padding;
  },
  margins: (props: { readonly margins: string }): unknown => {
    const margins: { [k: string]: number } = { top: 0, right: 0, bottom: 0, left: 0 };
    const propMargins = props.margins.toString().split(" ");
    if (!propMargins) {
      return margins;
    }

    if (propMargins.length === 1) {
      margins.top = Number(propMargins[0]);
      margins.right = Number(propMargins[0]);
      margins.bottom = Number(propMargins[0]);
      margins.left = Number(propMargins[0]);
      return margins;
    }
    propMargins.forEach((item: string, index) => {
      switch (index) {
        case 1:
          margins.top = Number(propMargins[0]);
          margins.right = Number(item);
          margins.bottom = Number(propMargins[0]);
          margins.left = Number(item);
          break;
        case 2:
          margins.top = Number(propMargins[0]);
          margins.right = Number(propMargins[1]);
          margins.bottom = Number(item);
          margins.left = Number(propMargins[1]);
          break;
        case 3:
          margins.top = Number(propMargins[0]);
          margins.right = Number(propMargins[1]);
          margins.bottom = Number(propMargins[2]);
          margins.left = Number(item);
          break;
        default:
          break;
      }
    });
    return margins;
  },
  borderColors: (props: { readonly borderColors: string }): unknown => {
    const borderColors: { [k: string]: string } = { top: "", right: "", bottom: "", left: "" };
    props.borderColors.split(" ").forEach((item: string, index) => {
      switch (index) {
        case 0:
          borderColors.top = item;
          break;
        case 1:
          borderColors.right = item;
          break;
        case 2:
          borderColors.bottom = item;
          break;
        case 3:
          borderColors.left = item;
          break;
        default:
          break;
      }
    });
    return borderColors;
  },
};

function imageProps(images: Record<string, ImageResource>, props: Record<string, unknown>): Image.ImageProps {
  const newProps = { ...props, width: props.width, height: props.height, imageResource: props.src };
  const image = images[(props.src as string) ?? ""];
  if (image) {
    if (image.width && image.height) {
      newProps.width = image.width;
      newProps.height = image.height;
    } else {
      const scaleX = (props.width as number) / image.abstractImage.size.width;
      const scaleY = (props.height as number) / image.abstractImage.size.height;
      if (scaleX < scaleY) {
        newProps.height = (props.height as number) * (scaleX / scaleY);
      } else {
        newProps.width = (props.width as number) * (scaleY / scaleX);
      }
    }
    newProps.imageResource = props.src as string;
  }
  return newProps as unknown as Image.ImageProps;
}
