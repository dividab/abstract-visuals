import { X2jOptions, X2jOptionsOptional, XMLParser } from "fast-xml-parser";
import Mustache from "mustache";
import { xsd } from "../xsd-template";
import { errorToReadableText, validateXml } from "./validation";

export type XmlElement = {
  readonly tagName: string;
  readonly attributes: Record<string, string>;
  readonly children: ReadonlyArray<XmlElement>;
  readonly textContent?: string;
};

//dummy

export type FastXmlElement = Record<string, ReadonlyArray<FastXmlElement> | Record<string, string>>;

const parsedXsd = parseXml(xsd.replace(/xs:/g, ""), {
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: "",
  allowBooleanAttributes: true,
  trimValues: false,
  ignoreDeclaration: true,
});

const options: Partial<X2jOptions> = {
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

export function parseMustacheXml(
  template: { readonly name: string; readonly template: string },
  data: any,
  partials: Record<string, string>
): { readonly type: "Ok"; readonly xml: ReadonlyArray<XmlElement> } | { readonly type: "Err"; readonly error: string } {
  // const preParse = parseXml(template.template, options);
  // const stringified = JSON.stringify(preParse);
  const mustacheResolvedXml = Mustache.render(template.template, data, partials);
  const validationErrors = validateXml(mustacheResolvedXml, parsedXsd);
  if (validationErrors.length > 0) {
    return { type: "Err", error: errorToReadableText(validationErrors, template.name) };
  }

  return { type: "Ok", xml: parseXml(mustacheResolvedXml, options) };
}

export function parseXml(text: string, options?: X2jOptionsOptional): ReadonlyArray<XmlElement> {
  const parser = new XMLParser(options);
  // Unescape HTML entity
  parser.addEntity("#x2F", "/");
  parser.addEntity("#x3D", "=");
  const parsedXml = parser.parse(text);
  return transformFXP(parsedXml);
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
