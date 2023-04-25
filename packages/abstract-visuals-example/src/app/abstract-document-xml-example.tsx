import * as React from "react";
import * as AD from "abstract-document";
import { AbstractDocExporters } from "abstract-document";
import { abstractDocOfXml, creators, extractImageFontsStyleNames } from "abstract-document/src/abstract-document-xml";
import { parseXml } from "abstract-document/src/abstract-document-xml/parse-xml/parse-xml";

export function AbstractDocumentXMLExample(): JSX.Element {
  const [value, setValue] = React.useState(`<AbstractDoc>
    <StyleNames>
        <StyleName name="footerResultText" type="TextStyle" fontSize="8" color="#353535" bold="true"/>
        <StyleName name="footerResultCell" type="TableCellStyle" padding="4 4 3 0" borders="1 0 0 0" borderColor="#123151" verticalAlignment="Bottom"/>
    </StyleNames>
    <Section>
        <Table columnWidths="375,70,60">
            <style margins="150 0 0 0"/>
            <TableRow>
                <TableCell styleName="footerResultCell"/>
                <TextCell text="Cost €" styleNames="footerResultText, footerResultCell"/>
                <TextCell text="Price €" styleNames="footerResultText, footerResultCell"/>
            </TableRow>
        </Table>
    </Section>
  </AbstractDoc>`);
  return (
    <div>
      <textarea value={value} onChange={(e) => setValue(e.currentTarget.value)}>
        Pdf
      </textarea>
      <button onClick={() => generatePDF(value)}>Generate PDF</button>
    </div>
  );
}

async function generatePDF(s: string): Promise<void> {
  // tslint:disable-next-line:no-require-imports
  const pdfKit = require("../pdfkit");
  const xml = parseXml(s, {
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

  const doc = abstractDocOfXml(
    creators({}, {}, extractImageFontsStyleNames(xml)[2]),
    xml[0]!
  ) as unknown as AD.AbstractDoc.AbstractDoc.AbstractDoc;

  const blob: Blob = await AbstractDocExporters.Pdf.exportToHTML5Blob(pdfKit, doc);
  const objectURL = URL.createObjectURL(blob);
  window.open(objectURL);
}
