import {
  TextStyle,
  Types,
  Font,
  Section,
  Atom,
  SectionElement,
  Paragraph,
  PageBreak,
  TextRun,
  TableRow,
  Table,
  TableCell,
  TextField,
  Image,
  Group,
  Markdown,
  TocSeparator,
  ImageResource as ADImageResource,
} from "../abstract-document/index.js";
import { AbstractDoc } from "../index.js";
import {
  ImageCell,
  ImageCellProps,
  TextCell,
  TextCellProps,
  TextParagraph,
  TextParagraphProps,
  TextRow,
  TextRowProps,
} from "./custom-elements.js";
import { XmlElement } from "./parse-xml/parse-xml.js";
import * as PropCreator from "./prop-creator.js";

export type ADObject = unknown;
export type ADCreatorFn = (props?: Record<string, unknown>, children?: ReadonlyArray<unknown>) => ADObject;

export type ImageResource = ADImageResource.ImageResource & { readonly width?: number; readonly height?: number };

export type TextRunProps = {
  readonly text: string;
  readonly styleName?: string;
  readonly style?: TextStyle.TextStyle;
};

export const creators: (
  images: Record<string, ImageResource>,
  fonts: Types.Indexer<Font.Font>,
  styleNames: StyleName
) => Record<string, ADCreatorFn> = (images, fonts, styleNames) => {
  return {
    AbstractDoc: (props, children: ReadonlyArray<Section.Section>) => {
      if (props) {
        props.fonts = fonts ?? undefined;
      }
      return AbstractDoc.AbstractDoc.create(props, children);
    },
    Paragraph: (props, children: ReadonlyArray<Atom.Atom>) => Paragraph.create(props, children),
    Section: (props, children: ReadonlyArray<SectionElement.SectionElement>) => Section.create(props, children),
    TextRun: (props) => TextRun.create(props as unknown as TextRun.TextRunProps),
    TextRow: (props: TextRowProps) => TextRow(props, styleNames),
    TextCell: (props: TextCellProps) => TextCell(props, styleNames),
    TextParagraph: (props: TextParagraphProps) => TextParagraph(props, styleNames),
    ImageCell: (props: ImageCellProps) => ImageCell(props, styleNames),
    Table: (props, children: ReadonlyArray<TableRow.TableRow>) =>
      Table.create(props as unknown as Table.TableProps, children),
    TableRow: (props, children: ReadonlyArray<TableCell.TableCell>) => TableRow.create(props, children),
    TableCell: (props, children: ReadonlyArray<SectionElement.SectionElement>) => TableCell.create(props, children),
    TextField: (props) => TextField.create(props as unknown as TextField.TextFieldProps),
    Image: (props: Record<string, unknown>) => {
      const image = images[(props.src as string) ?? ""];
      if (image) {
        if (image.width && image.height) {
          props.width = image.width;
          props.height = image.height;
        } else {
          const scaleX = (props.width as number) / image.abstractImage.size.width;
          const scaleY = (props.height as number) / image.abstractImage.size.height;
          if (scaleX < scaleY) {
            props.height = (props.height as number) * (scaleX / scaleY);
          } else {
            props.width = (props.width as number) * (scaleY / scaleX);
          }
        }

        props.imageResource = images[props.src as string];
      }
      return Image.create(props as unknown as Image.ImageProps);
    },
    Group: (props, children) => Group.create(props, children as ReadonlyArray<Group.Group>),
    PageBreak: () => PageBreak.create(),
    Markdown: (props) => Markdown.create(props as unknown as Markdown.MarkdownProps),
    TocSeparator: (props) => TocSeparator.create(props as TocSeparator.TocSeparatorProps),
  };
};

export function AbstractDocOfXml(
  creators: Record<string, ADCreatorFn>,
  xmlElement: XmlElement,
  onlyChildren: boolean = false
): ADObject {
  const children = [];
  const props: Record<string, unknown> = {};
  for (const childElement of xmlElement.children ?? []) {
    const childName = childElement.tagName;
    if (childName !== undefined) {
      // Handle StyleNames & StyleName by converting
      // <StyleNames>
      //     <StyleName name="kalle" .../>
      // <StyleNames>
      // to:
      // styles: {
      //   kalle: {...}
      // }

      if (childName === "StyleNames") {
        props.styles = AbstractDocOfXml(creators, childElement);
      } else if (childName === "StyleName" && childElement.attributes && childElement.attributes.name) {
        const styleName = childElement.attributes.name;
        const style = AbstractDocOfXml(creators, childElement);
        props[styleName] = style;
      } else if (childName.startsWith(childName.charAt(0).toUpperCase())) {
        // For uppercase elements we add them to the children key
        children.push(AbstractDocOfXml(creators, childElement));
      } else {
        // For lowercase elements we add them as keys using their name
        // Some special keys should directly have an array of children as value instead of an object with children key
        const childrenOnly = childName === "header" || childName === "footer" || childName === "headerRows";
        props[childName] = AbstractDocOfXml(creators, childElement, childrenOnly);
      }
    }
  }
  if (onlyChildren) {
    return children;
  }

  // Create the abstract doc object to return
  const allProps = { ...xmlElement.attributes, ...props };
  const defaultCreator: ADCreatorFn = () => ({ ...allProps });
  const creator = xmlElement.tagName && creators[xmlElement.tagName] ? creators[xmlElement.tagName] : defaultCreator;
  if (creator === undefined) {
    throw new Error(`Could not find creator for element with name ${xmlElement.tagName}`);
  }
  //
  const theObj = creator(allProps, children) as { [k: string]: unknown };

  for (const propName of Object.keys(allProps)) {
    const propsCreator =
      allProps[propName] && PropCreator.propsCreators[propName] ? PropCreator.propsCreators[propName] : undefined;
    if (propsCreator) {
      theObj[propsCreator.name] = propsCreator(allProps, children);
    }
  }

  // Elements styling needs to have style: {type= "StyleName" }. Occures when having a <style></style> element.
  if (theObj.type && (theObj.type as string) === "Table") {
    theObj.style = { ...(theObj.style as Object), type: "TableStyle" };
  }
  if (theObj.type && (theObj.type as string).startsWith("Text")) {
    theObj.style = { ...(theObj.style as Object), type: "TextStyle" };
  }
  if (theObj.type && (theObj.type as string) === "Paragraph") {
    theObj.style = {
      ...(theObj.style as Object),
      type: "ParagraphStyle",
      textStyle: { type: "TextStyle" },
    };
  }
  if (theObj.columnSpan) {
    theObj.style = { ...(theObj.style as Object), type: "TableCellStyle" };
  }
  // let theObj["columnWidths"] = propsCreator(allProps, children);
  if (children.length > 0) {
    (theObj as { children: Array<unknown> }).children = children;
  }
  return theObj;
}

export function extractImageFontsStyleNames(
  xmlElement: ReadonlyArray<XmlElement>
): readonly [images: ReadonlyArray<string>, fonts: ReadonlyArray<string>, styleNames: Record<string, string>] {
  const images = Array<string>();
  const fonts = Array<string>();
  let styleNames: Record<string, string> = {};
  xmlElement.forEach((item) => {
    if (item.tagName === "Image" && item.attributes?.src) {
      images.push(item.attributes.src as string);
    } else if (item.attributes?.fontFamily) {
      fonts.push(item.attributes.fontFamily as string);
    } else if (item.tagName === "StyleName" && item.attributes.name && item.attributes.type) {
      styleNames[item.attributes.name as string] = item.attributes.type;
    } else {
      const [newImages, newFonts, newStyleNames] = extractImageFontsStyleNames(item.children);
      images.push(...newImages);
      fonts.push(...newFonts);
      styleNames = { ...styleNames, ...newStyleNames };
    }
  });
  return [images, fonts, styleNames];
}

export type StyleName = Record<string, string>;
