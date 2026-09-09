import { describe, test, expect } from "vitest";
import { abstractDocXml } from "../abstract-doc-of-xml/abstract-doc-of-xml.js";
import { testSimpleDocument } from "./simple-document.js";

describe("abstract-doc-xml", () => {
  [testSimpleDocument].forEach((item) => {
    test(item.name, () => {
      const [doc] = abstractDocXml(item.abstractDocXML, {}, {});
      expect(doc).toEqual(item.expectedPdfJson);
    });
  });
});
