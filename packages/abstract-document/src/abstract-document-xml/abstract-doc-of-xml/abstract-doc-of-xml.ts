import { XmlElement } from "../parse-xml";
import { ADCreatorFn, propsCreators } from "./creator.js";

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
  const theObj = creator(allProps, children) as { [k: string]: unknown };

  for (const propName of Object.keys(allProps)) {
    const propsCreator = allProps[propName] && propsCreators[propName] ? propsCreators[propName] : undefined;
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
