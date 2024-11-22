import { ADCreatorFn, propsCreators } from "./creator";
import { XmlElement } from "../mustache-xml";

export function abstractDocOfXml(
  creators: Record<string, ADCreatorFn>,
  xmlElement: XmlElement,
  onlyChildren: boolean = false
): unknown {
  const children = [];
  const props: Record<string, unknown> = {};
  for (const childElement of xmlElement.children ?? []) {
    const childName = childElement.tagName;
    if (childName !== undefined) {
      if (childName === "StyleNames") {
        props.styles = abstractDocOfXml(creators, childElement);
      } else if (childName === "StyleName" && childElement.attributes && childElement.attributes.name) {
        const styleName = childElement.attributes.name;
        const style = abstractDocOfXml(creators, childElement);
        props[styleName] = style;
      } else if (childName.startsWith(childName.charAt(0).toUpperCase())) {
        // For uppercase elements we add them to the children key
        children.push(abstractDocOfXml(creators, childElement));
      } else {
        // For lowercase elements we add them as keys using their name
        // Some special keys should directly have an array of children as value instead of an object with children key
        const childrenOnly = childName === "header" || childName === "footer" || childName === "headerRows";
        props[childName] = abstractDocOfXml(creators, childElement, childrenOnly);
      }
    }
  }
  if (onlyChildren) {
    return children;
  }

  // Create the abstract doc object to return
  const allProps = { ...xmlElement.attributes, ...props };
  const creator = xmlElement.tagName && creators[xmlElement.tagName] ? creators[xmlElement.tagName] : () => allProps;
  if (creator === undefined) {
    throw new Error(`Could not find creator for element with name ${xmlElement.tagName}`);
  }
  //
  const obj = creator(allProps, children) as { [k: string]: unknown };

  for (const propName of Object.keys(allProps)) {
    const propsCreator = allProps[propName] && propsCreators[propName] ? propsCreators[propName] : undefined;
    if (propsCreator) {
      obj[propsCreator.name] = propsCreator(allProps, children);
    }
  }

  // Elements styling needs to have style: {type= "StyleName" }. Occures when having a <style></style> element.
  if (typeof obj.style === "object") {
    if (obj.columnSpan) {
      obj.style = { ...obj.style, type: "TableCellStyle" };
    } else {
      switch (obj.type) {
        case "page":
          obj.style = { ...obj.style, type: "MasterPageStyle" };
          break;
        case "Group":
          obj.style = { ...obj.style, type: "GroupStyle" };
          break;
        case "Table":
          obj.style = { ...obj.style, type: "TableStyle" };
          break;
        // Cell is missing type in abstract doc?!?!?!
        // case "TableCell":
        // case "ImageCell":
        // case "TextCell":
        //   obj.style = { ...obj.style, type: "TableCellStyle" };
        //   break;
        case "TextParagraph":
        case "ImageParagraph":
        case "Paragraph":
          obj.style = { ...obj.style, type: "ParagraphStyle" };
          break;
        case "TextField":
        case "HyperLink":
        case "TextRun":
          obj.style = { ...obj.style, type: "TextStyle" };
          break;
        default:
          break;
      }
    }
  }

  if (children.length > 0) {
    obj.children = children;
  }
  return obj;
}

export function extractImageFontsStyleNames(
  xmlElement: ReadonlyArray<XmlElement>,
  styleNames: Record<string, string> = {},
  images: Array<{ readonly src: string; readonly width: number | undefined; readonly height: number | undefined }> = [],
  fonts: Array<string> = []
): readonly [
  images: ReadonlyArray<{
    readonly src: string;
    readonly width: number | undefined;
    readonly height: number | undefined;
  }>,
  fonts: ReadonlyArray<string>,
  styleNames: Record<string, string>
] {
  xmlElement.forEach((item) => {
    if (item.tagName.startsWith("Image") && item.attributes?.src) {
      images.push({
        src: item.attributes.src as string,
        height: item.attributes.height ? Number(item.attributes.height) : undefined,
        width: item.attributes.width ? Number(item.attributes.width) : undefined,
      });
    } else if (item.attributes?.fontFamily) {
      fonts.push(item.attributes.fontFamily as string);
      if (item.tagName === "StyleName" && item.attributes.name && item.attributes.type) {
        styleNames[item.attributes.name as string] = item.attributes.type;
      }
    } else if (item.tagName === "StyleName" && item.attributes.name && item.attributes.type) {
      styleNames[item.attributes.name as string] = item.attributes.type;
    } else {
      extractImageFontsStyleNames(item.children, styleNames, images, fonts);
    }
  });
  return [images, fonts, styleNames];
}
