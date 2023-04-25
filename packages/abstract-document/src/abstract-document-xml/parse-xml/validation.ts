import { ValidationError, XMLValidator } from "fast-xml-parser";
import { XmlElement, parseXml, findElement } from "./parse-xml";

enum ErrorType {
  warning = 0,
  error = 1,
}

type Range = {
  readonly startLineNumber: number;
  readonly startColumn: number;
  readonly endLineNumber: number;
  readonly endColumn: number;
};
type Position = {
  readonly lineNumber: number;
  readonly column: number;
};

type ErrorObject = {
  readonly range: Range;
  readonly options: ErrorOptions;
};

type ErrorOptions = {
  readonly className: string;
  // eslint-disable-next-line functional/prefer-readonly-type
  readonly hoverMessage: Array<{
    readonly value: string;
  }>;
};

type XmlError = {
  readonly message: string;
  readonly type: ErrorType;
  readonly range: Range;
};

// eslint-disable-next-line functional/prefer-readonly-type
export function validateXml(fullXml: string, xsdSchema: ReadonlyArray<XmlElement>): Array<ErrorObject> {
  const errors: Array<XmlError> = [];

  // ignore all mustache brackets
  const matchMustacheBrackets = /{{.*}}(?!([\S]))/g;
  // Ignore xml comments
  const xmlComments = /<!--[^>]*-->/g;

  // Replace matches with spaces of same length
  let cleanedXml = fullXml.replace(matchMustacheBrackets, (m) => " ".repeat(m.length));
  cleanedXml = cleanedXml.replace(xmlComments, (m) => {
    const x = (m.match(/^.*$/gm) || []).map((m2) => " ".repeat(m2.length));
    return x.join("\n");
  });

  const xml = `<xml>\n${cleanedXml}\n</xml>`;

  if (xml) {
    try {
      const result = XMLValidator.validate(xml, {
        allowBooleanAttributes: true,
      });

      if (result !== true) {
        errors.push(getErrorFromException(result, xml));
      }
      const entryPointXml = parseXml(xml, {
        preserveOrder: true,
        ignoreAttributes: false,
        attributeNamePrefix: "",
        allowBooleanAttributes: true,
        trimValues: false,
        ignoreDeclaration: true,
      })[0]!;

      const entryPointSchema = xsdSchema[0]!;
      let pos = 0;
      const lines = cleanedXml.split("\n");
      const getRangeOfElement = (text: string, incrementPosition: boolean = true): Range => {
        if (text === undefined) {
          const monacoPosition = getPositionFromIndex(lines, pos);
          return toRange(
            monacoPosition.lineNumber,
            monacoPosition.column,
            monacoPosition.lineNumber,
            monacoPosition.column + 5
          );
        }
        const position = cleanedXml.indexOf(text, pos);
        if (incrementPosition) {
          pos = position >= pos ? position + text.length : pos;
        }
        const monacoPosition = getPositionFromIndex(lines, position);
        return toRange(
          monacoPosition.lineNumber,
          monacoPosition.column,
          monacoPosition.lineNumber,
          monacoPosition.column + text.length
        );
      };

      const validationErrors = entryPointXml.children.flatMap((child) =>
        validateElements(child, undefined, entryPointSchema, getRangeOfElement)
      );
      errors.push(...validationErrors);
    } catch (e) {
      errors.push(createError(e.message, ErrorType.error, toRange(1, 1, 1, 100)));
    }
  }

  return errors.map((e) => getDecorationsFromError(e));
}

function validateElements(
  element: XmlElement,
  schemaElement: XmlElement | undefined,
  completeSchema: XmlElement,
  getRangeOfElement: (elementName: string, incrementPosition?: boolean) => Range
): ReadonlyArray<XmlError> {
  const errors: Array<XmlError> = [];

  // Validate element name
  const tagName = element.tagName;
  const range = getRangeOfElement(tagName);

  const slashPosition = getRangeOfElement("/", false);
  const closingTagPosition = getRangeOfElement(">", false);
  const isClosed = rangeLessThan(slashPosition, closingTagPosition);

  const validElements = Object.values(completeSchema.children);
  const schemaName = schemaElement?.attributes.type || tagName;
  const foundSchemaElement = findElement(validElements, schemaName);

  if (!foundSchemaElement) {
    return [createError(`"${tagName}" is not a valid element`, ErrorType.error, range)];
  }

  const possibleAttributes = Array.from(foundSchemaElement.children).flatMap((c) =>
    c.tagName === "attribute" ? c : []
  );

  // Validate required attributes
  for (const possibleAttribute of possibleAttributes) {
    const attributeName = possibleAttribute.attributes.name;
    const isRequired = possibleAttribute.attributes.use;
    if (attributeName && isRequired && isRequired === "required") {
      if (element.attributes[attributeName] === undefined) {
        errors.push(createError(`"${attributeName}" is a required attribute on "${tagName}"`, ErrorType.error, range));
      }
    }
  }

  // Validate existing attributes
  for (const [attrKey, attrVal] of Object.entries(element.attributes)) {
    const possibleAttrNames = possibleAttributes.flatMap((p) => p.attributes.name || []);
    const attrText = typeof attrVal === "string" ? `${attrKey}="${attrVal}"` : attrKey;
    const attrRange = getRangeOfElement(attrText, false);
    if (!possibleAttrNames.includes(attrKey)) {
      errors.push(createError(`"${attrKey}" is a not a valid attribute on "${tagName}"`, ErrorType.error, attrRange));
    }
  }

  // Validate that the children are allowed as a child of current element
  // and then validate the children themselves
  const schemaChildren = Object.values(foundSchemaElement.children);

  for (const child of element.children) {
    const childName = child.tagName;
    if (!childName) {
      continue;
    }
    const foundChild = findElement(schemaChildren, childName);
    if (!foundChild) {
      const childRange = getRangeOfElement(childName, false);
      if (childRange) {
        errors.push(createError(`"${childName}" is not a valid child of "${tagName}"`, ErrorType.error, childRange));
      }
    }

    const elementErrors = validateElements(child, foundChild, completeSchema, getRangeOfElement);
    errors.push(...elementErrors);
  }

  if (!isClosed) {
    // Increment position to after closing tag
    getRangeOfElement(`</${tagName}`, true);
  }

  return errors;
}

function getDecorationsFromError(error: XmlError): ErrorObject {
  return {
    range: error.range,
    options: {
      className: getErrorClassNames(error),
      hoverMessage: [{ value: getErrorType(error) }, { value: getErrorMessage(error) }],
    },
  };
}

function getErrorFromException(result: ValidationError, xml: string): XmlError {
  const { col, line, msg } = result.err;
  const startLine = line - 1;
  const lines = xml.split("\n");
  const rowText = lines[startLine] || "";
  const length = rowText.indexOf(">") - rowText.indexOf("<") || 4;
  const range = toRange(startLine, col, startLine, col + length);

  return createError(msg!, ErrorType.error, range);
}

function getErrorClassNames(error: XmlError): string {
  switch (error.type) {
    case ErrorType.warning:
      return "xml-lint xml-lint--warning";
    case ErrorType.error:
      return "xml-lint xml-lint--error";
    default:
      return "";
  }
}

function getErrorType(error: XmlError): string {
  switch (error.type) {
    case ErrorType.warning:
      return "**Warning**";
    case ErrorType.error:
      return "**Error**";
    default:
      return "";
  }
}

function getErrorMessage(error: XmlError): string {
  return error.message.split(/[\t\n]/g)[1] ?? error.message;
}

function createError(message: string, type: ErrorType, range: Range): XmlError {
  return { message, type, range };
}

function getPositionFromIndex(lines: ReadonlyArray<string>, index: number): Position {
  let totalLength = 0;
  for (const [lineNumber, line] of lines.entries()) {
    totalLength += line.length;
    if (totalLength >= index - lineNumber) {
      return {
        lineNumber: lineNumber + 1,
        column: 1 + index - (totalLength - line.length) - lineNumber || 1, // "- lineNumber" because of \n characters
      };
    }
  }
  return { lineNumber: lines.length, column: 1 };
}

function toRange(startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number): Range {
  return { startLineNumber, startColumn, endLineNumber, endColumn };
}

export function errorToReadableText(errors: ReadonlyArray<ErrorObject>, templateName: string = ""): string {
  const errorLines: Array<string> = [];
  if (templateName) {
    errorLines.push(`Error in template ${templateName} \n`);
  }
  for (const error of errors) {
    const hoverErrors = error.options.hoverMessage.map((e) => e.value.replace(/\*/g, ""));
    errorLines.push(`${hoverErrors.join("\n")}`);
    errorLines.push(`On line ${error.range.startLineNumber}, column ${error.range.startColumn}\n`);
  }

  return errorLines.join("\n");
}

function rangeLessThan(range1: Range, range2: Range): boolean {
  return range1.startLineNumber < range2.startLineNumber
    ? true
    : range1.startLineNumber > range2.startLineNumber
    ? false
    : range1.startColumn < range2.startColumn;
}
