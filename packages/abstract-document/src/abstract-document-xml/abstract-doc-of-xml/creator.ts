import * as AI from "abstract-image";
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
  ImageResource,
} from "../../abstract-document/index.js";
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
} from "./custom-elements.js";

export type ADCreatorFn = (props?: Record<string, unknown>, children?: ReadonlyArray<unknown>) => unknown;

export const creators: (styleNames: Record<string, string>) => Record<string, ADCreatorFn> = (styleNames) => {
  return {
    AbstractDoc: (props, children: ReadonlyArray<Section.Section>) => AbstractDoc.create(props, children),
    Section: (props, children: ReadonlyArray<SectionElement.SectionElement>) => Section.create(props, children),
    Paragraph: (props, children: ReadonlyArray<Atom.Atom>) => Paragraph.create(props, children),
    TextRow: (props: TextRowProps) => TextRow(props, styleNames),
    TextCell: (props: TextCellProps) => TextCell(props, styleNames),
    TextParagraph: (props: TextParagraphProps) => TextParagraph(props, styleNames),
    TextRun: (props) => TextRun.create(props as unknown as TextRun.TextRunProps),
    ImageRow: (props: ImageRowProps) => ImageRow(imageProps(props) as unknown as ImageRowProps, styleNames),
    ImageCell: (props: ImageCellProps) => ImageCell(imageProps(props) as unknown as ImageCellProps, styleNames),
    ImageParagraph: (props: ImageParagraphProps) =>
      ImageParagraph(imageProps(props) as unknown as ImageParagraphProps, styleNames),
    Image: (props: Record<string, unknown>) => Image.create(imageProps(props) as unknown as Image.ImageProps),
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
        fixedStyles[key] = { ...props.styles[key] };
      });
    }

    return { ...fixedStyles, ...DefaultStyles.createStandardStyles() };
  },
  columnWidths: (props: { readonly columnWidths: string; readonly columnMultiplier: string }): unknown => {
    const columnWidths = (props.columnWidths ?? "")
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
  paperSize: (props: { readonly paperSize: string }): unknown => {
    if (props.paperSize === "A4" || props.paperSize === "Letter") {
      return props.paperSize;
    }
    const parts = props.paperSize.split("x");
    return { width: Number(parts[0]) ?? 595, height: Number(parts[1]) ?? 842 };
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
  borderTop: (props: { readonly borderTop: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const borders: { top?: number, bottom?: number, left?: number, right?: number } = allProps.borders ?? {};
    borders.top = Number(props.borderTop);
    return borders; 
  },
  borderBottom: (props: { readonly borderBottom: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const borders: { top?: number, bottom?: number, left?: number, right?: number } = allProps.borders ?? {};
    borders.bottom = Number(props.borderBottom);
    return borders; 
  },
  borderLeft: (props: { readonly borderLeft: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const borders: { top?: number, bottom?: number, left?: number, right?: number } = allProps.borders ?? {};
    borders.left = Number(props.borderLeft);
    return borders; 
  },
  borderRight: (props: { readonly borderRight: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const borders: { top?: number, bottom?: number, left?: number, right?: number } = allProps.borders ?? {};
    borders.right = Number(props.borderRight);
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
  paddingTop: (props: { readonly paddingTop: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const padding: { top?: number, bottom?: number, left?: number, right?: number } = allProps.padding ?? {};
    padding.top = Number(props.paddingTop);
    return padding; 
  },
  paddingBottom: (props: { readonly paddingBottom: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const padding: { top?: number, bottom?: number, left?: number, right?: number } = allProps.padding ?? {};
    padding.bottom = Number(props.paddingBottom);
    return padding; 
  },
  paddingLeft: (props: { readonly paddingLeft: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const padding: { top?: number, bottom?: number, left?: number, right?: number } = allProps.padding ?? {};
    padding.left = Number(props.paddingLeft);
    return padding; 
  },
  paddingRight: (props: { readonly paddingRight: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const padding: { top?: number, bottom?: number, left?: number, right?: number } = allProps.padding ?? {};
    padding.right = Number(props.paddingRight);
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
  marginTop: (props: { readonly marginTop: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const margins: { top?: number, bottom?: number, left?: number, right?: number } = allProps.margins ?? {};
    margins.top = Number(props.marginTop);
    return margins; 
  },
  marginBottom: (props: { readonly marginBottom: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const margins: { top?: number, bottom?: number, left?: number, right?: number } = allProps.margins ?? {};
    margins.bottom = Number(props.marginBottom);
    return margins; 
  },
  marginLeft: (props: { readonly marginLeft: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const margins: { top?: number, bottom?: number, left?: number, right?: number } = allProps.margins ?? {};
    margins.left = Number(props.marginLeft);
    return margins; 
  },
  marginRight: (props: { readonly marginRight: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const margins: { top?: number, bottom?: number, left?: number, right?: number } = allProps.margins ?? {};
    margins.right = Number(props.marginRight);
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
  borderColorTop: (props: { readonly borderColorTop: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const margins: { top?: string, bottom?: string, left?: string, right?: string } = allProps.borderColors ?? {};
    margins.top = props.borderColorTop;
    return margins; 
  },
  borderColorBottom: (props: { readonly borderColorBottom: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const boderColors: { top?: string, bottom?: string, left?: string, right?: string } = allProps.borderColors ?? {};
    boderColors.bottom = props.borderColorBottom;
    return boderColors; 
  },
  borderColorLeft: (props: { readonly borderColorLeft: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const boderColors: { top?: string, bottom?: string, left?: string, right?: string } = allProps.borderColors ?? {};
    boderColors.left = props.borderColorLeft;
    return boderColors; 
  },
  borderColorRight: (props: { readonly borderColorRight: string }): unknown => {
    const allProps = props as Record<string, unknown>;
    const boderColors: { top?: string, bottom?: string, left?: string, right?: string } = allProps.borderColors ?? {};
    boderColors.right = props.borderColorRight;
    return boderColors; 
  },
};

const zero = AI.createPoint(0, 0);
const size = AI.createSize(0, 0);
function imageProps(props: Record<string, unknown>): Record<string, unknown> {
  return {
    ...props,
    imageResource: ImageResource.create({
      id: props.src as string,
      abstractImage: AI.createAbstractImage(zero, size, AI.white, [
        AI.createBinaryImage(zero, zero, "png", { type: "url", url: props.src as string }),
      ]),
      renderScale: 1,
    }),
  };
}
