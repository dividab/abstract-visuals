import * as DocxConstants from "./docx-constants";
import { XmlWriter } from "./xml-writer";

//tslint:disable:no-class no-this

export class RefContainer {
  // tslint:disable-next-line:readonly-keyword
  _references: Array<string> = [];

  private readonly _xmlWriter: XmlWriter = new XmlWriter();

  get XMLWriter(): XmlWriter {
    return this._xmlWriter;
  }

  constructor() {
    this.XMLWriter.WriteStartDocument(true);
    this.XMLWriter.WriteStartElement(
      "Relationships",
      DocxConstants.RelationNamespace
    );
  }

  AddReference(refId: string, filePath: string, type: string): void {
    if (filePath.startsWith("/") === false) {
      filePath = "/" + filePath;
    }
    this.AddReference2(refId, filePath, type);
  }

  AddReference2(refId: string, filePath: string, type: string): void {
    if (this._references.indexOf(refId) !== -1) {
      return;
    }
    this.XMLWriter.WriteStartElement("Relationship");
    this.XMLWriter.WriteAttributeString("Type", type);
    filePath = filePath.replace("\\", "/");
    this.XMLWriter.WriteAttributeString("Target", filePath);
    this.XMLWriter.WriteAttributeString("Id", refId);
    this.XMLWriter.WriteEndElement();
    this._references.push(refId);
  }

  get count(): number {
    return this._references.length;
  }

  finish(): void {
    this.XMLWriter.WriteEndElement();
    this.XMLWriter.close();
    this._references = [];
  }
}
