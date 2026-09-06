import * as DocxConstants from "./docx-constants.js";
import type { XmlWriter } from "./xml-writer.js";
import { createXmlWriter } from "./xml-writer.js";

export interface RefContainer {
  readonly XMLWriter: XmlWriter;
  readonly count: number;
  AddReference: (refId: string, filePath: string, type: string) => void;
  AddReference2: (refId: string, filePath: string, type: string) => void;
  finish: () => void;
}

export function createRefContainer(): RefContainer {
  let references: Array<string> = [];
  const xmlWriter = createXmlWriter();

  xmlWriter.WriteStartDocument(true);
  xmlWriter.WriteStartElement("Relationships", DocxConstants.RelationNamespace);

  function addReference2(refId: string, filePath: string, type: string): void {
    if (references.indexOf(refId) !== -1) {
      return;
    }
    xmlWriter.WriteStartElement("Relationship");
    xmlWriter.WriteAttributeString("Type", type);
    filePath = filePath.replace("\\", "/");
    xmlWriter.WriteAttributeString("Target", filePath);
    xmlWriter.WriteAttributeString("Id", refId);
    xmlWriter.WriteEndElement();
    references.push(refId);
  }

  return {
    get XMLWriter(): XmlWriter {
      return xmlWriter;
    },

    get count(): number {
      return references.length;
    },

    AddReference(refId: string, filePath: string, type: string): void {
      if (!filePath.startsWith("/")) {
        filePath = "/" + filePath;
      }
      addReference2(refId, filePath, type);
    },

    AddReference2: addReference2,

    finish(): void {
      xmlWriter.WriteEndElement();
      xmlWriter.close();
      references = [];
    },
  };
}
