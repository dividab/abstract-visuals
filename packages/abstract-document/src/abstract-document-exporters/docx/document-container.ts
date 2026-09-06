import type { RefContainer } from "./ref-container.js";
import { createRefContainer } from "./ref-container.js";
import type { XmlWriter } from "./xml-writer.js";
import { createXmlWriter } from "./xml-writer.js";

export interface DocumentContainer {
  readonly filePath: string;
  readonly fileName: string;
  readonly refId: string;
  readonly contentType: string;
  readonly references: RefContainer;
  readonly XMLWriter: XmlWriter;
}

export function createDocumentContainer(filePath: string, fileName: string, refId: string, contentType: string): DocumentContainer {
  const xmlWriter = createXmlWriter();

  return {
    filePath,
    fileName,
    refId,
    contentType,
    references: createRefContainer(),

    get XMLWriter(): XmlWriter {
      return xmlWriter;
    },
  };
}
