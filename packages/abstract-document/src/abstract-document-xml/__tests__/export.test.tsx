import path from "path";
import { loadTests, onlySkip } from "@abstract-visuals/test-utils";
import { ExportTestDef } from "./export-test-def";
import { parseXml } from "../parse-xml";
import { AbstractDocOfXml, extractImageFontsStyleNames } from "../abstract-doc-of-xml";
import { creators } from "../creator";
import { AbstractDoc } from "../../abstract-document";

export const tests = loadTests<ExportTestDef>(path.join(__dirname, "test-defs/"));

describe("abstract-doc-xml", () => {
  onlySkip(tests).forEach((item) => {
    test(item.name, async () => {
      const xml = parseXml(item.abstractDocXML, {
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
      });

      const doc = AbstractDocOfXml(
        creators(item.images, item.fonts, extractImageFontsStyleNames(xml)[2]),
        xml[0]!
      ) as unknown as AbstractDoc.AbstractDoc;

      expect(JSON.stringify(doc, undefined, 2)).toEqual(item.expectedPdfJson);
    });
  });
});
