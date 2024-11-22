import * as FXmlP from "fast-xml-parser";
import Mustache from "mustache";

export type XmlElement = {
  readonly tagName: string;
  readonly attributes: Record<string, string>;
  readonly children: ReadonlyArray<XmlElement>;
  readonly textContent?: string;
};

type FastXmlElement = Record<string, ReadonlyArray<FastXmlElement> | Record<string, string>>;

const defaultOptions: Partial<FXmlP.X2jOptions> = {
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: "",
  allowBooleanAttributes: true,
  trimValues: false,
  ignoreDeclaration: true,
  processEntities: true,
  htmlEntities: true,
  attributeValueProcessor: (_name, value) => {
    if (!value?.trim()) {
      return value;
    }
    const nValue = Number(value);
    if (!Number.isNaN(nValue)) {
      return nValue;
    }
    return value;
  },
};

export const render = Mustache.render;

export function parseRenderedXml(
  template: string,
  data: any,
  partials: Record<string, string>
): ReadonlyArray<XmlElement> {
  return parseXml(Mustache.render(template, data, partials));
}

export function parseXml(text: string, options: Partial<FXmlP.X2jOptions> = defaultOptions): ReadonlyArray<XmlElement> {
  const parser = new FXmlP.XMLParser(options);
  parser.addEntity("#x2F", "/");
  parser.addEntity("#x3D", "=");
  return transformFXP(parser.parse(text));
}

// Transforms fast-xml-parser format to a format that is much easier to work with
function transformFXP(parsedXml: ReadonlyArray<FastXmlElement>): ReadonlyArray<XmlElement> {
  return parsedXml.flatMap((element) => {
    const key = Object.keys(element).find((k) => k !== ":@" && k !== "#text")!;
    if (key === "?xml") {
      return [];
    }
    const children = ((element[key] || []) as Array<FastXmlElement>).filter((c) => {
      const key = Object.keys(c)[0];
      return key !== "#text" && key !== ":@";
    });
    const attributes = (element[":@"] as Record<string, string>) || {};
    const textChilds: Array<string> = ((element[key] || []) as Array<FastXmlElement>)
      .filter((c) => {
        const key = Object.keys(c)[0];
        return key === "#text";
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .flatMap((t) => t["#text"] as any as string);
    const textContents = textChilds.flatMap((text) => {
      const cleaned = text.replace(/\n/g, "").replace(/\t/g, "").trim();
      return cleaned ? [text] : [];
    });
    const textContent = textContents.join("\n");
    return { tagName: key, attributes: attributes, children: transformFXP(children), textContent: textContent };
  });
}

export function findElement(
  elements: ReadonlyArray<XmlElement>,
  elementName: string | undefined
): XmlElement | undefined {
  if (!elementName) {
    return undefined;
  }
  for (const elem of elements) {
    if (elem.tagName === "annotation" || elem.tagName === "attribute") {
      continue;
    }
    if (shouldSkipLevel(elem)) {
      const childElement = findElement(Array.from(elem.children), elementName);
      if (childElement) {
        return shouldSkipLevel(childElement)
          ? findElement(Array.from(childElement.children), elementName)
          : childElement;
      }
    }
    if (elem.attributes.name === elementName) {
      return elem;
    }
  }
  return undefined;
}

export function getChildren(elements: ReadonlyArray<XmlElement>): ReadonlyArray<XmlElement> {
  for (const elem of elements) {
    if (elem.tagName === "annotation" || elem.tagName === "attribute") {
      continue;
    }
    if (shouldSkipLevel(elem)) {
      const child = getChildren(Array.from(elem.children));
      if (child.length > 0) {
        return child.flatMap((c) => (shouldSkipLevel(c) ? getChildren(Array.from(c.children)) : c));
      }
    }
    return elements;
  }
  return [];
}

function shouldSkipLevel(tag: XmlElement): boolean {
  return (
    tag.tagName === "all" || tag.tagName === "sequence" || tag.tagName === "choice" || tag.attributes.name === undefined
  );
}
