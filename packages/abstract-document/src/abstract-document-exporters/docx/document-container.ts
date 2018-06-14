import { RefContainer } from "./ref-container";
import { XmlWriter } from "./xml-writer";

//tslint:disable:no-class no-this

export class DocumentContainer {
  readonly filePath: string;
  readonly fileName: string;
  readonly refId: string;
  readonly contentType: string;
  readonly references: RefContainer = new RefContainer();

  private readonly _xmlWriter: XmlWriter = new XmlWriter();

  get XMLWriter(): XmlWriter {
    return this._xmlWriter;
  }
}
