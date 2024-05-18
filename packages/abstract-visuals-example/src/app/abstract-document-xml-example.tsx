/* eslint-disable @typescript-eslint/no-misused-promises */
import * as React from "react";
import * as AD from "abstract-document";
import { AbstractDocExporters } from "abstract-document";
import { abstractDocOfXml, creators, extractImageFontsStyleNames } from "abstract-document/src/abstract-document-xml";
import { parseMustacheXml } from "abstract-document/src/abstract-document-xml/parse-xml/parse-xml";

export function AbstractDocumentXMLExample(): JSX.Element {
  const [pdf, setPdf] = React.useState<{ type: "Ok"; url: string } | { type: "Err"; error: string } | undefined>(
    undefined
  );
  const [data, setData] = React.useState('{ "test": "Hello world" }');
  const [template, setTemplate] = React.useState(`<AbstractDoc>
    <StyleNames>
        <StyleName name="footerResultText" type="TextStyle" fontSize="8" color="#353535" bold="true"/>
        <StyleName name="footerResultCell" type="TableCellStyle" padding="4 4 3 0" borders="1 0 0 0" borderColor="#123151" verticalAlignment="Bottom"/>
    </StyleNames>
    <Section>
        <Table columnWidths="375,70,60">
            <style margins="150 0 0 0"/>
            <TableRow>
                <TableCell styleName="footerResultCell"/>
                <TextCell text="{{test}}" styleNames="footerResultText, footerResultCell"/>
                <TextCell text="Price €" styleNames="footerResultText, footerResultCell"/>
            </TableRow>
        </Table>
    </Section>
  </AbstractDoc>`);

  return (
    <div style={{ display: "flex", margin: "10px 0 0 10px", gap: "10px", width: "100%", height: "calc(100% - 40px)" }}>
      <div style={{ display: "flex", flexDirection: "column", width: "25%", height: "100%", gap: "10px" }}>
        <span>Data</span>
        <textarea
          style={{ width: "100%", height: "calc(100% - 30px)" }}
          value={data}
          onChange={(e) => setData(e.currentTarget.value)}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: "43%", height: "100%", gap: "10px" }}>
        <span>Template</span>
        <textarea
          style={{ width: "100%", height: "calc(100% - 30px)" }}
          value={template}
          onChange={(e) => setTemplate(e.currentTarget.value)}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "32%",
          height: "100%",
        }}
      >
        <button onClick={async () => setPdf(await generatePDF(data, template))}>Generate PDF</button>
        {pdf?.type === "Err" ? (
          <h3>{pdf.error}</h3>
        ) : (
          <embed
            src={pdf?.type === "Ok" ? pdf.url : undefined}
            type="application/pdf"
            style={{ width: "100%", height: "calc(100% - 30px)" }}
          />
        )}
      </div>
    </div>
  );
}

async function generatePDF(
  data: string,
  template: string
): Promise<{ type: "Ok"; url: string } | { type: "Err"; error: string }> {
  let dataObject = {};
  try {
    dataObject = JSON.parse(data);
  } catch (e) {
    return { type: "Err", error: "Failed to parse JSON." };
  }
  const parsed = parseMustacheXml({ name: "template", template }, dataObject, {});
  if (parsed.type === "Err") {
    return parsed;
  }
  const doc = abstractDocOfXml(
    creators({}, {}, extractImageFontsStyleNames(parsed.xml)[2]),
    parsed.xml[0]!
  ) as unknown as AD.AbstractDoc.AbstractDoc.AbstractDoc;
  const blob: Blob = await AbstractDocExporters.Pdf.exportToHTML5Blob((window as any).PDFDocument, doc);
  const objectURL = URL.createObjectURL(blob);
  return { type: "Ok", url: objectURL };
}
