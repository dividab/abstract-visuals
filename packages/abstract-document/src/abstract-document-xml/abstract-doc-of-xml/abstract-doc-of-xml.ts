import { AbstractDoc } from "../../abstract-document/index.js";
import { ADCreatorFn, creators, propsCreators } from "./creator.js";
import { parseHandlebarsXml, parseMustacheXml, type XmlElement } from "handlebars-xml";

export function abstractDocXml(
  template: string,
  data: any,
  partials: Record<string, string>,
  rendered: "Mustache" | "Handlebars" = "Handlebars"
): readonly [AbstractDoc.AbstractDoc, imageUrls: Record<string, true>, fontFamilies: Record<string, true>] {
  const xml =
    rendered === "Mustache" ? parseMustacheXml(template, data, partials) : parseHandlebarsXml(template, data, partials);
  const [imageUrls, fontFamilies, styleNames] = extractImageFontsStyleNames(xml);
  return [abstractDocXmlRecursive(creators(styleNames), xml[0]!), imageUrls, fontFamilies];
}

function abstractDocXmlRecursive(
  creators: Record<string, ADCreatorFn>,
  xmlElement: XmlElement,
  onlyChildren: boolean = false
): any {
  const children = [];
  const props: Record<string, unknown> = {};
  for (const childElement of xmlElement.children ?? []) {
    const childName = childElement.tagName;
    if (childName !== undefined) {
      if (childName === "StyleNames") {
        props.styles = abstractDocXmlRecursive(creators, childElement);
      } else if (childName === "StyleName" && childElement.attributes && childElement.attributes.name) {
        const styleName = childElement.attributes.name;
        const style = abstractDocXmlRecursive(creators, childElement);
        props[styleName] = style;
      } else if (childName.startsWith(childName.charAt(0).toUpperCase())) {
        // For uppercase elements we add them to the children key
        children.push(abstractDocXmlRecursive(creators, childElement));
      } else {
        // For lowercase elements we add them as keys using their name
        // Some special keys should directly have an array of children as value instead of an object with children key
        const arrayedElements = ["frontHeader", "frontFooter", "header", "footer", "headerRows"];
        const childrenOnly = arrayedElements.findIndex((e) => e === childName) !== -1;
        props[childName] = abstractDocXmlRecursive(creators, childElement, childrenOnly);
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

function extractImageFontsStyleNames(
  xmlElement: ReadonlyArray<XmlElement>,
  styleNames: Record<string, string> = {},
  images: Record<string, true> = {},
  fonts: Record<string, true> = {}
): readonly [imageUrls: Record<string, true>, fontFamilies: Record<string, true>, styleNames: Record<string, string>] {
  xmlElement.forEach((item) => {
    if (item.tagName.startsWith("Image") && item.attributes?.src) {
      images[item.attributes.src as string] = true;
    } else if (item.attributes?.fontFamily) {
      fonts[item.attributes.fontFamily as string] = true;
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
