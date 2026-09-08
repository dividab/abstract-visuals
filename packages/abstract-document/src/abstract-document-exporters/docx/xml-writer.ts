interface XmlNamespaceDictionary {
  [ns: string]: string;
}

interface XmlElementContext {
  elementName: string;
  namespaces: XmlNamespaceDictionary;
  contentStringWritten: boolean;
}

type XmlWriterState = "Start" | "Prolog" | "Element" | "Content" | "Error" | "Closed";

export interface XmlWriter {
  WriteStartDocument: (standalone?: boolean) => void;
  WriteComment: (text: string) => void;
  WriteStartElement: (localName: string, ns?: string, prefix?: string) => void;
  WriteString: (text: string) => void;
  WriteElementString: (localName: string, value: string, ns: string, prefix: string) => void;
  WriteAttributeString: (localName: string, value: string, ns?: string, prefix?: string) => void;
  WriteEndElement: () => void;
  Flush: () => void;
  close: () => void;
  getXml: () => string;
}

function generatePrefix(namespaces: XmlNamespaceDictionary): string {
  let i = 1;
  while (i < 100) {
    if (!Object.hasOwn(namespaces, "p" + i)) {
      break;
    }
    i++;
  }
  return "p" + i;
}

function getPrefixedName(localName: string, prefix: string | undefined): string {
  if (prefix) {
    return `${prefix}:${localName}`;
  } else {
    // oxlint-disable-next-line typescript/no-unnecessary-template-expression
    return `${localName}`;
  }
}

export function createXmlWriter(): XmlWriter {
  const quoteChar = '"';
  const encoding = "utf-8";
  const indentSize = 2;

  let xml = "";
  let state: XmlWriterState = "Start";
  const contextStack: Array<XmlElementContext> = [];

  function write(text: string): void {
    xml += text;
  }

  function peekContextStack(): XmlElementContext {
    return contextStack[contextStack.length - 1];
  }

  function throwInvalidState(): void {
    throw new Error(`Invalid state '${state}'.`);
  }

  // Find existing prefix for a specified namespace
  function getPrefixFromAncestors(ns: string): string | undefined {
    for (const context of contextStack) {
      for (const prefix of Object.keys(context.namespaces)) {
        if (context.namespaces[prefix] === ns) {
          return prefix;
        }
      }
    }
    return undefined;
  }

  function addNamespace(ns: string, prefix: string | undefined): void {
    // Make sure we don't duplicate prefixes
    peekContextStack().namespaces[prefix ?? ""] = ns;
  }

  function writeIndent(newLine: boolean = true): void {
    if (indentSize > 0) {
      if (newLine) {
        write("\n");
      }
      if (!(state === "Start" || state === "Prolog")) {
        for (let i = 0; i < indentSize * (contextStack.length - 1); i++) {
          write(" ");
        }
      }
    }
  }

  function getNamespacesNotInAncestors(namespaces: XmlNamespaceDictionary): XmlNamespaceDictionary {
    const toWrite: XmlNamespaceDictionary = {};
    for (const prefix of Object.keys(namespaces)) {
      let exists: boolean = false;
      // Don't check the current (last) context in the stack
      for (let i = 0; i < contextStack.length - 1; i++) {
        const context = contextStack[i];
        if (context.namespaces[prefix] === namespaces[prefix]) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        toWrite[prefix] = namespaces[prefix];
      }
    }
    return toWrite;
  }

  function writeNamespaceAttribute(ns: string, prefix: string | undefined): void {
    if (ns) {
      if (prefix) {
        write(` xmlns:${prefix}="${ns}"`);
      } else {
        write(` xmlns="${ns}"`);
      }
    }
  }

  function writeNamespaceAttributes(namespaces: XmlNamespaceDictionary): void {
    // We should not repeat namespaces that exists in our ancestors
    // Check which of our current namespaces that does not exist in this ancestor
    const toWrite = getNamespacesNotInAncestors(namespaces);

    // Write the ones that was not found in ancestor
    for (const prefix of Object.keys(toWrite)) {
      writeNamespaceAttribute(namespaces[prefix], prefix);
    }
  }

  function completeStartElement(closeElement: boolean, namespaces: XmlNamespaceDictionary): void {
    writeNamespaceAttributes(namespaces);
    if (closeElement) {
      write(" />");
    } else {
      write(">");
    }
  }

  const self: XmlWriter = {
    WriteStartDocument(standalone?: boolean): void {
      try {
        if (state === "Start" || state === "Prolog") {
          let bufBld: string = "";
          bufBld += "version=" + quoteChar + "1.0" + quoteChar;
          if (encoding !== null) {
            bufBld += ` encoding=${quoteChar}${encoding}${quoteChar}`;
          }
          if (standalone) {
            const standAlone = standalone ? "yes" : "no";
            bufBld += ` standalone=${quoteChar}${standAlone}${quoteChar}`;
          }
          writeIndent(state !== "Start");
          const xmlProcessingIntruction = `<?xml ${bufBld}?>`;
          write(xmlProcessingIntruction);
        } else {
          throwInvalidState();
        }
        // Set next state
        state = "Prolog";
      } catch (e) {
        state = "Error";
        throw e;
      }
    },

    WriteComment(text: string): void {
      try {
        if (state === "Prolog" || state === "Content") {
          if (text && (text.indexOf("--") >= 0 || (text.length !== 0 && text.endsWith("-")))) {
            throw new Error("Xml_InvalidCommentChars");
          }
          text = text || "";
          writeIndent();
          write(`<!--${text}-->`);
        } else {
          throwInvalidState();
        }
        // Set next state
        // For XML-comments this case the next state should be the same as the previous one!
      } catch (e) {
        state = "Error";
        throw e;
      }
    },

    WriteStartElement(localName: string, ns?: string, prefix?: string): void {
      try {
        if (state === "Start" || state === "Prolog" || state === "Element" || state === "Content") {
          if (state === "Element") {
            // Close previous start-element
            completeStartElement(false, peekContextStack().namespaces);
          }

          // Push new element-context to stack
          const elementName: string = getPrefixedName(localName, prefix);
          contextStack.push({
            elementName,
            namespaces: {},
            contentStringWritten: false,
          });

          writeIndent(state !== "Start");
          write("<" + elementName);

          if (ns) {
            addNamespace(ns, prefix);
          }
        } else {
          throwInvalidState();
        }
        // Set next state
        state = "Element";
      } catch (e) {
        state = "Error";
        throw e;
      }
    },

    WriteString(text: string): void {
      try {
        if (state === "Content" || state === "Element") {
          if (state === "Element") {
            completeStartElement(false, peekContextStack().namespaces);
          }

          // Flag that content string has been written
          peekContextStack().contentStringWritten = true;

          write(text);
        } else {
          throwInvalidState();
        }
        // Set next state
        state = "Content";
      } catch (e) {
        state = "Error";
        throw e;
      }
    },

    WriteElementString(localName: string, value: string, ns: string, prefix: string): void {
      self.WriteStartElement(localName, ns, prefix);
      if (value && value.length > 0) {
        self.WriteString(value);
      }
      self.WriteEndElement();
    },

    WriteAttributeString(localName: string, value: string, ns?: string, prefix?: string): void {
      try {
        if (state === "Element") {
          if (ns) {
            // Seems like a prefix is always invented for attributes if not provided
            // (but for elements it is OK to have blank prefix)
            if (!prefix || prefix.length === 0) {
              prefix = getPrefixFromAncestors(ns);
              // oxlint-disable-next-line typescript/prefer-nullish-coalescing -- an ancestor-registered blank prefix ("") must still be replaced here, per the comment above
              if (!prefix) {
                prefix = generatePrefix(peekContextStack().namespaces);
              }
            }
            addNamespace(ns, prefix);
          }
          const attributeName: string = getPrefixedName(localName, prefix);
          write(` ${attributeName}=${quoteChar}${value}${quoteChar}`);
        } else {
          throwInvalidState();
        }
        // Set next state
        state = "Element";
      } catch (e) {
        state = "Error";
        throw e;
      }
    },

    WriteEndElement(): void {
      try {
        if (state === "Content" || state === "Element") {
          const context = peekContextStack();
          // Only close in itself if no content
          if (state === "Element") {
            completeStartElement(true, context.namespaces);
          } else {
            // Do not indent if there is text content written since
            // the indention would be included in the actual text content
            if (!context.contentStringWritten) {
              writeIndent();
            }
            write(`</${context.elementName}>`);
          }
          contextStack.pop();
        } else {
          throwInvalidState();
        }
        // Set next state
        if (contextStack.length === 0) {
          state = "Closed";
        } else {
          state = "Content";
        }
      } catch (e) {
        state = "Error";
        throw e;
      }
    },

    Flush(): void {
      self.close();
    },

    close(): void {
      state = "Closed";
    },

    getXml(): string {
      return xml;
    },
  };

  return self;
}
