/* eslint-disable @typescript-eslint/no-misused-promises */
import React from "react";
import * as HSXML from "../../../handlebars-xml/src/index.js";
import {
  AbstractDoc as AD,
  AbstractDocExporters,
  AbstractDocXml as ADXml,
} from "../../../abstract-document/src/index.js";

export function AbstractDocumentXMLExample(): React.JSX.Element {
  const [pdf, setPdf] = React.useState<{ type: "Ok"; url: string } | { type: "Err"; error: string } | undefined>(
    undefined
  );
  const [data, setData] = React.useState('{ "test": "Hello world", "truthy": true, "falsy": false }');
  const [template, setTemplate] = React.useState(`<AbstractDoc>
    {{#*inline "inlinePartial"}}
        <TextCell text="Testing inline partial" />
    {{/inline}}
    <StyleNames>
        <StyleName name="footerResultText" type="TextStyle" fontSize="8" color="#353535" bold="true"/>
        <StyleName name="footerResultCell" type="TableCellStyle" padding="4 4 3 0" borders="1 0 0 0" borderColor="#123151" verticalAlignment="Bottom"/>
    </StyleNames>
    <Section>
        <Table columnWidths="200,70,60, 60">
            <style margins="150 0 0 0"/>
            <TableRow>
                <TableCell styleName="footerResultCell"/>
                <TextCell text="{{test}}" styleNames="footerResultText, footerResultCell"/>
                <TextCell text="Price €" styleNames="footerResultText, footerResultCell"/>
                {{#truthy}}
                <TextCell text="Price2 €" styleNames="footerResultText, footerResultCell"/>
                {{/truthy}}
                {{#falsy}}
                <TextCell text="Price3 €" styleNames="footerResultText, footerResultCell"/>
                {{/falsy}}
            </TableRow>
            <TableRow>
                {{> inlinePartial}}
            </TableRow>
          {{>partial}}
        </Table>
    </Section>
  </AbstractDoc>`);

  const [partial, setPartial] = React.useState(`<TableRow>
    <TextCell text="{{test}}!" />
</TableRow>`);

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
        <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%", gap: "10px" }}>
          <textarea
            style={{ width: "100%", height: "calc(100% - 30px)" }}
            value={template}
            onChange={(e) => setTemplate(e.currentTarget.value)}
          />
        </div>

        <span>Partial ("partial")</span>
        <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%", gap: "10px" }}>
          <textarea
            style={{ width: "100%", height: "calc(100% - 30px)" }}
            value={partial}
            onChange={(e) => setPartial(e.currentTarget.value)}
          />
        </div>
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
        <button onClick={async () => setPdf(await generatePDF(data, template, { partial: partial }))}>
          Generate PDF
        </button>
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
  template: string,
  partial: Record<string, string>
): Promise<{ type: "Ok"; url: string } | { type: "Err"; error: string }> {
  let dataObject = {};
  try {
    dataObject = JSON.parse(data);
  } catch (e) {
    return { type: "Err", error: "Failed to parse JSON." + e };
  }
  const handlebarsRendered = HSXML.renderHandlebars(template, dataObject, partial);
  const validationErrors = HSXML.validateXml(handlebarsRendered, ADXml.parsedXsd);
  if (validationErrors.length > 0) {
    return { type: "Err", error: HSXML.errorToReadableText(validationErrors, "template") };
  }
  const xml = HSXML.parseXml(handlebarsRendered);

  const doc = ADXml.abstractDocOfXml(
    ADXml.creators({}, {}, ADXml.extractImageFontsStyleNames(xml)[2]),
    xml[0]!
  ) as unknown as AD.AbstractDoc.AbstractDoc;
  const blob: Blob = await AbstractDocExporters.Pdf.exportToHTML5Blob((window as any).PDFDocument, doc);
  const objectURL = URL.createObjectURL(blob);
  return { type: "Ok", url: objectURL };
}
