import { createAbstractImage, createBinaryImage, createPoint, createSize, white } from "abstract-image";
import type { Atom, SectionElement } from "../../abstract-document/index.js";
import {
  AbstractDoc,
  DefaultStyles,
  Group,
  Image,
  Markdown,
  PageBreak,
  Paragraph,
  Section,
  Table,
  TableCell,
  TableRow,
  TextField,
  TextRun,
  TocSeparator,
  ImageResource,
} from "../../abstract-document/index.js";
import type { TextRowProps, TextCellProps, TextParagraphProps, ImageCellProps, ImageParagraphProps, ImageRowProps } from "./custom-elements.js";
import { TextRow, TextCell, TextParagraph, ImageCell, ImageParagraph, ImageRow } from "./custom-elements.js";

export type ADCreatorFn = (props?: Record<string, unknown>, children?: ReadonlyArray<unknown>) => unknown;

export const creators: (styleNames: Record<string, string>) => Record<string, ADCreatorFn> = (styleNames) => {
  return {
    AbstractDoc: ((props, children: ReadonlyArray<Section.Section>) => AbstractDoc.create(props, children)) as ADCreatorFn,
    Section: ((props, children: ReadonlyArray<SectionElement.SectionElement>) => Section.create(props, children)) as ADCreatorFn,
    Paragraph: ((props, children: ReadonlyArray<Atom.Atom>) => Paragraph.create(props, children)) as ADCreatorFn,
    TextRow: ((props: TextRowProps) => TextRow(props, styleNames)) as ADCreatorFn,
    TextCell: ((props: TextCellProps) => TextCell(props, styleNames)) as ADCreatorFn,
    TextParagraph: ((props: TextParagraphProps) => TextParagraph(props, styleNames)) as ADCreatorFn,
    TextRun: (props) => TextRun.create(props as unknown as TextRun.TextRunProps),
    ImageRow: ((props: Record<string, unknown>) => ImageRow(imageProps(props) as unknown as ImageRowProps, styleNames)) as ADCreatorFn,
    ImageCell: ((props: Record<string, unknown>) => ImageCell(imageProps(props) as unknown as ImageCellProps, styleNames)) as ADCreatorFn,
    ImageParagraph: ((props: Record<string, unknown>) =>
      ImageParagraph(imageProps(props) as unknown as ImageParagraphProps, styleNames)) as ADCreatorFn,
    Image: ((props: Record<string, unknown>) => Image.create(imageProps(props) as unknown as Image.ImageProps)) as ADCreatorFn,
    Table: ((props, children: ReadonlyArray<TableRow.TableRow>) => Table.create(props as unknown as Table.TableProps, children)) as ADCreatorFn,
    TableRow: ((props, children: ReadonlyArray<TableCell.TableCell>) => TableRow.create(props, children)) as ADCreatorFn,
    TableCell: ((props, children: ReadonlyArray<SectionElement.SectionElement>) => TableCell.create(props, children)) as ADCreatorFn,
    TextField: (props) => TextField.create(props as unknown as TextField.TextFieldProps),
    Group: (props, children) => Group.create(props, children as ReadonlyArray<Group.Group>),
    PageBreak: () => PageBreak.create(),
    Markdown: (props) => Markdown.create(props as unknown as Markdown.MarkdownProps),
    TocSeparator: (props) => TocSeparator.create(props as TocSeparator.TocSeparatorProps),
  };
};

export const propsCreators: Record<string, ADCreatorFn> = {
  styles: ((props: { readonly styles: Record<string, Record<string, string | number> & { readonly type: string }> }): unknown => {
    const fixedStyles: Record<string, Record<string, string | number>> = {};
    Object.keys(props.styles).forEach((key: string) => {
      fixedStyles[key] = { ...props.styles[key] };
    });

    return { ...fixedStyles, ...DefaultStyles.createStandardStyles() };
  }) as ADCreatorFn,
  columnWidths: ((props: { readonly columnWidths: string; readonly columnMultiplier: string }): unknown => {
    const columnWidths = props.columnWidths.split(",").map((item: string) => {
      const number = Number(item);
      return number === 0 || Number.isNaN(number) ? Infinity : number;
    });
    if (props.columnMultiplier) {
      return columnWidths.map((l) => l * Number(props.columnMultiplier));
    }
    return columnWidths;
  }) as ADCreatorFn,
  paperSize: ((props: { readonly paperSize: string }): unknown => {
    if (props.paperSize === "A4" || props.paperSize === "Letter") {
      return props.paperSize;
    }
    const parts = props.paperSize.split("x");
    const width = Number(parts[0] ?? 595);
    const height = Number(parts[1] ?? 842);
    return { width: Number.isNaN(width) ? 595 : width, height: Number.isNaN(height) ? 842 : height };
  }) as ADCreatorFn,
  borders: ((props: { readonly borders: string }): unknown => {
    const borders: { [k: string]: number } = { top: 0, right: 0, bottom: 0, left: 0 };
    const propBorders = props.borders.split(" ");

    if (propBorders.length === 1) {
      borders["top"] = Number(propBorders[0]);
      borders["right"] = Number(propBorders[0]);
      borders["bottom"] = Number(propBorders[0]);
      borders["left"] = Number(propBorders[0]);
      return borders;
    }

    propBorders.forEach((item: string, index) => {
      switch (index) {
        case 1:
          borders["top"] = Number(propBorders[0]);
          borders["right"] = Number(item);
          borders["bottom"] = Number(propBorders[0]);
          borders["left"] = Number(item);
          break;
        case 2:
          borders["top"] = Number(propBorders[0]);
          borders["right"] = Number(propBorders[1]);
          borders["bottom"] = Number(item);
          borders["left"] = Number(propBorders[1]);
          break;
        case 3:
          borders["top"] = Number(propBorders[0]);
          borders["right"] = Number(propBorders[1]);
          borders["bottom"] = Number(propBorders[2]);
          borders["left"] = Number(item);
          break;
        default:
          break;
      }
    });
    return borders;
  }) as ADCreatorFn,
  borderTop: ((props: { readonly borderTop: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const borders: { top?: number; bottom?: number; left?: number; right?: number } = allProps["borders"] ?? {};
    borders.top = Number(props.borderTop);
    return borders;
  }) as ADCreatorFn,
  borderBottom: ((props: { readonly borderBottom: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const borders: { top?: number; bottom?: number; left?: number; right?: number } = allProps["borders"] ?? {};
    borders.bottom = Number(props.borderBottom);
    return borders;
  }) as ADCreatorFn,
  borderLeft: ((props: { readonly borderLeft: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const borders: { top?: number; bottom?: number; left?: number; right?: number } = allProps["borders"] ?? {};
    borders.left = Number(props.borderLeft);
    return borders;
  }) as ADCreatorFn,
  borderRight: ((props: { readonly borderRight: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const borders: { top?: number; bottom?: number; left?: number; right?: number } = allProps["borders"] ?? {};
    borders.right = Number(props.borderRight);
    return borders;
  }) as ADCreatorFn,
  padding: ((props: { readonly padding: string }): unknown => {
    const padding: { [k: string]: number } = { top: 0, right: 0, bottom: 0, left: 0 };

    const paddings = props.padding.split(" ");

    if (paddings.length === 1) {
      padding["top"] = Number(paddings[0]);
      padding["right"] = Number(paddings[0]);
      padding["bottom"] = Number(paddings[0]);
      padding["left"] = Number(paddings[0]);
      return padding;
    }

    paddings.forEach((item: string, index) => {
      switch (index) {
        case 1:
          padding["top"] = Number(paddings[0]);
          padding["right"] = Number(item);
          padding["bottom"] = Number(paddings[0]);
          padding["left"] = Number(item);
          break;
        case 2:
          padding["top"] = Number(paddings[0]);
          padding["right"] = Number(paddings[1]);
          padding["bottom"] = Number(item);
          padding["left"] = Number(paddings[1]);
          break;
        case 3:
          padding["top"] = Number(paddings[0]);
          padding["right"] = Number(paddings[1]);
          padding["bottom"] = Number(paddings[2]);
          padding["left"] = Number(item);
          break;
        default:
          break;
      }
    });
    return padding;
  }) as ADCreatorFn,
  paddingTop: ((props: { readonly paddingTop: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const padding: { top?: number; bottom?: number; left?: number; right?: number } = allProps["padding"] ?? {};
    padding.top = Number(props.paddingTop);
    return padding;
  }) as ADCreatorFn,
  paddingBottom: ((props: { readonly paddingBottom: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const padding: { top?: number; bottom?: number; left?: number; right?: number } = allProps["padding"] ?? {};
    padding.bottom = Number(props.paddingBottom);
    return padding;
  }) as ADCreatorFn,
  paddingLeft: ((props: { readonly paddingLeft: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const padding: { top?: number; bottom?: number; left?: number; right?: number } = allProps["padding"] ?? {};
    padding.left = Number(props.paddingLeft);
    return padding;
  }) as ADCreatorFn,
  paddingRight: ((props: { readonly paddingRight: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const padding: { top?: number; bottom?: number; left?: number; right?: number } = allProps["padding"] ?? {};
    padding.right = Number(props.paddingRight);
    return padding;
  }) as ADCreatorFn,
  margins: ((props: { readonly margins: string }): unknown => {
    const margins: { [k: string]: number } = { top: 0, right: 0, bottom: 0, left: 0 };
    const propMargins = props.margins.split(" ");

    if (propMargins.length === 1) {
      margins["top"] = Number(propMargins[0]);
      margins["right"] = Number(propMargins[0]);
      margins["bottom"] = Number(propMargins[0]);
      margins["left"] = Number(propMargins[0]);
      return margins;
    }
    propMargins.forEach((item: string, index) => {
      switch (index) {
        case 1:
          margins["top"] = Number(propMargins[0]);
          margins["right"] = Number(item);
          margins["bottom"] = Number(propMargins[0]);
          margins["left"] = Number(item);
          break;
        case 2:
          margins["top"] = Number(propMargins[0]);
          margins["right"] = Number(propMargins[1]);
          margins["bottom"] = Number(item);
          margins["left"] = Number(propMargins[1]);
          break;
        case 3:
          margins["top"] = Number(propMargins[0]);
          margins["right"] = Number(propMargins[1]);
          margins["bottom"] = Number(propMargins[2]);
          margins["left"] = Number(item);
          break;
        default:
          break;
      }
    });
    return margins;
  }) as ADCreatorFn,
  marginTop: ((props: { readonly marginTop: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const margins: { top?: number; bottom?: number; left?: number; right?: number } = allProps["margins"] ?? {};
    margins.top = Number(props.marginTop);
    return margins;
  }) as ADCreatorFn,
  marginBottom: ((props: { readonly marginBottom: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const margins: { top?: number; bottom?: number; left?: number; right?: number } = allProps["margins"] ?? {};
    margins.bottom = Number(props.marginBottom);
    return margins;
  }) as ADCreatorFn,
  marginLeft: ((props: { readonly marginLeft: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const margins: { top?: number; bottom?: number; left?: number; right?: number } = allProps["margins"] ?? {};
    margins.left = Number(props.marginLeft);
    return margins;
  }) as ADCreatorFn,
  marginRight: ((props: { readonly marginRight: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const margins: { top?: number; bottom?: number; left?: number; right?: number } = allProps["margins"] ?? {};
    margins.right = Number(props.marginRight);
    return margins;
  }) as ADCreatorFn,
  borderColors: ((props: { readonly borderColors: string }): unknown => {
    const borderColors: { [k: string]: string } = { top: "", right: "", bottom: "", left: "" };
    props.borderColors.split(" ").forEach((item: string, index) => {
      switch (index) {
        case 0:
          borderColors["top"] = item;
          break;
        case 1:
          borderColors["right"] = item;
          break;
        case 2:
          borderColors["bottom"] = item;
          break;
        case 3:
          borderColors["left"] = item;
          break;
        default:
          break;
      }
    });
    return borderColors;
  }) as ADCreatorFn,
  borderColorTop: ((props: { readonly borderColorTop: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const margins: { top?: string; bottom?: string; left?: string; right?: string } = allProps["borderColors"] ?? {};
    margins.top = props.borderColorTop;
    return margins;
  }) as ADCreatorFn,
  borderColorBottom: ((props: { readonly borderColorBottom: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const boderColors: { top?: string; bottom?: string; left?: string; right?: string } = allProps["borderColors"] ?? {};
    boderColors.bottom = props.borderColorBottom;
    return boderColors;
  }) as ADCreatorFn,
  borderColorLeft: ((props: { readonly borderColorLeft: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const boderColors: { top?: string; bottom?: string; left?: string; right?: string } = allProps["borderColors"] ?? {};
    boderColors.left = props.borderColorLeft;
    return boderColors;
  }) as ADCreatorFn,
  borderColorRight: ((props: { readonly borderColorRight: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const boderColors: { top?: string; bottom?: string; left?: string; right?: string } = allProps["borderColors"] ?? {};
    boderColors.right = props.borderColorRight;
    return boderColors;
  }) as ADCreatorFn,

  //decimal/integer values
  width: ((props: { readonly width: string }) => strToNum(props.width)) as ADCreatorFn,
  height: ((props: { readonly height: string }) => strToNum(props.height)) as ADCreatorFn,
  rowSpan: ((props: { readonly rowSpan: string }) => strToNum(props.rowSpan)) as ADCreatorFn,
  columnSpan: ((props: { readonly columnSpan: string }) => strToNum(props.columnSpan)) as ADCreatorFn,
  fontScale: ((props: { readonly fontScale: string }) => strToNum(props.fontScale)) as ADCreatorFn,
  fontSize: ((props: { readonly fontSize: string }) => strToNum(props.fontSize)) as ADCreatorFn,
  lineGap: ((props: { readonly lineGap: string }) => strToNum(props.lineGap)) as ADCreatorFn,
  characterSpacing: ((props: { readonly characterSpacing: string }) => strToNum(props.characterSpacing)) as ADCreatorFn,
  verticalPosition: ((props: { readonly verticalPosition: string }) => strToNum(props.verticalPosition)) as ADCreatorFn,
  indent: ((props: { readonly indent: string }) => strToNum(props.indent)) as ADCreatorFn,
  top: ((props: { readonly top: string }) => strToNum(props.top)) as ADCreatorFn,
  bottom: ((props: { readonly bottom: string }) => strToNum(props.bottom)) as ADCreatorFn,
  left: ((props: { readonly left: string }) => strToNum(props.left)) as ADCreatorFn,
  right: ((props: { readonly right: string }) => strToNum(props.right)) as ADCreatorFn,
  columnCount: ((props: { readonly columnCount: string }) => strToNum(props.columnCount)) as ADCreatorFn,
  columnGap: ((props: { readonly columnGap: string }) => strToNum(props.columnGap)) as ADCreatorFn,

  //boolean values
  bold: ((props: { readonly bold: string }): unknown => strToBool(props.bold)) as ADCreatorFn,
  italic: ((props: { readonly italic: string }): unknown => strToBool(props.italic)) as ADCreatorFn,
  underline: ((props: { readonly underline: string }): unknown => strToBool(props.underline)) as ADCreatorFn,
  superScript: ((props: { readonly superScript: string }): unknown => strToBool(props.superScript)) as ADCreatorFn,
  subScript: ((props: { readonly subScript: string }): unknown => strToBool(props.subScript)) as ADCreatorFn,
  lineBreak: ((props: { readonly lineBreak: string }): unknown => strToBool(props.lineBreak)) as ADCreatorFn,
  mediumBold: ((props: { readonly mediumBold: string }): unknown => strToBool(props.mediumBold)) as ADCreatorFn,
  noTopBottomMargin: ((props: { readonly noTopBottomMargin: string }): unknown => strToBool(props.noTopBottomMargin)) as ADCreatorFn,
  keepTogetherSections: ((props: { readonly keepTogetherSections: string }): unknown => strToBool(props.keepTogetherSections)) as ADCreatorFn,
  keepTogether: ((props: { readonly keepTogether: string }): unknown => strToBool(props.keepTogether)) as ADCreatorFn,
  differentFirstPage: ((props: { readonly differentFirstPage: string }): unknown => strToBool(props.differentFirstPage)) as ADCreatorFn,
};

const zero = createPoint(0, 0);
const size = createSize(0, 0);
function imageProps(props: Record<string, unknown>): Record<string, unknown> {
  return {
    ...props,
    width: Number(props["width"]),
    height: Number(props["height"]),
    imageResource: ImageResource.create({
      id: props["src"] as string,
      abstractImage: createAbstractImage(zero, size, white, [createBinaryImage(zero, zero, "png", { type: "url", url: props["src"] as string })]),
      renderScale: 1,
    }),
  };
}

// bold/italic/etc. are declared `xs:boolean` in the XSD schema; XSD's boolean lexical space is {true, false, 1, 0}
const strToBool = (str: string | undefined): boolean => str === "true" || str === "1";

const strToNum = (str: string | undefined): number => {
  const num = Number(str);
  return Number.isFinite(num) ? num : 0;
};
