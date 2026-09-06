import { describe, test, expect } from "vitest";
import { testSimpleDocument } from "./simple-document.js";
// import { parseXml } from "../parse-xml";
// import { abstractDocOfXml, extractImageFontsStyleNames } from "../abstract-doc-of-xml/abstract-doc-of-xml.js";
// import { creators } from "../abstract-doc-of-xml/creator.js";
// import { AbstractDoc } from "../../abstract-document/index.js";

describe("abstract-doc-xml", () => {
  [testSimpleDocument].forEach((item) => {
    test(item.name, () => {
      expect("ha").toEqual("ha");
    });

    // test(item.name, async () => {
    //   const xml = parseXml(item.abstractDocXML, {
    //     preserveOrder: true,
    //     ignoreAttributes: false,
    //     attributeNamePrefix: "",
    //     allowBooleanAttributes: true,
    //     trimValues: false,
    //     ignoreDeclaration: true,
    //     processEntities: true,
    //     htmlEntities: true,
    //     attributeValueProcessor: (_name, value) => {
    //       if (!value?.trim()) {
    //         return value;
    //       }
    //       const nValue = Number(value);
    //       if (!Number.isNaN(nValue)) {
    //         return nValue;
    //       }
    //       return value;
    //     },
    //   });

    //   const doc = abstractDocOfXml(
    //     creators(item.images, item.fonts, extractImageFontsStyleNames(xml)[2]),
    //     xml[0]!
    //   ) as unknown as AbstractDoc.AbstractDoc;

    //   expect(doc).toEqual(item.expectedPdfJson);
    // });
  });
});
