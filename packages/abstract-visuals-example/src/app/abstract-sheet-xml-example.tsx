/* eslint-disable @typescript-eslint/no-misused-promises */
import * as React from "react";
import {
  AbstractSheet,
  abstractSheetXml,
  errorToReadableText,
  parsedXsd,
  parseXml,
  render,
  toCsv,
  toXlsx,
  validateXml,
} from "abstract-sheet";
import FileSaver from "file-saver";

export function AbstractSheetXMLExample(): JSX.Element {
  const [data, setData] = React.useState('{ "test": "Hello world", "truthy": true, "falsy": false }');
  const [template, setTemplate] = React.useState(`<AbstractSheet>
  <Styles>
    <Style name="boldText" size="8" bold="true"/>
    <Style name="yellowBackground" foreground="FFFFAA00"/>
  </Styles>
  <Sheets>
    <Sheet name="sheet1">
      <Rows>
        <Row>
          <Cell value="4" type="number" />
          <Cell value="24" type="number" styles="boldText"/>
          <Cell value="4" type="number" styles="boldText"/>
          <Cell value="4" type="number"/>
          <Cell value="4" type="number"/>
          <Cell value="4" type="number"/>
        </Row>
        <Row>
          <Cell value="0" type="number" styles="yellowBackground"/>
          <Cell value="4" type="number"/>
          <Cell value="1" type="number"/>
          <Cell value="4" type="number" styles="yellowBackground,boldText"/>
          <Cell value="4" type="number"/>
          {{#truthy}}
          <Cell value="rendered" type="string"/>
          {{/truthy}}
          {{#falsy}}
          <Cell value="not rendered:" type="string"/>
          {{/falsy}}
        </Row>
      </Rows>
      <ColInfos>
      </ColInfos>
      <RowInfos>
      </RowInfos>
    </Sheet>
  </Sheets>
</AbstractSheet>`);

  const [sheet, setSheet] = React.useState<
    { type: "Ok"; sheet: AbstractSheet } | { type: "Err"; error: string } | undefined
  >(createSheet(data, template));

  return (
    <div style={{ display: "flex", margin: "10px 0 0 10px", gap: "10px", width: "100%", height: "calc(100% - 40px)" }}>
      <div style={{ display: "flex", flexDirection: "column", width: "25%", height: "100%", gap: "10px" }}>
        <span>Data</span>
        <textarea
          style={{ width: "100%", height: "calc(100% - 30px)" }}
          value={data}
          onChange={(e) => {
            setData(e.currentTarget.value);
            setSheet(createSheet(e.currentTarget.value, template));
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: "43%", height: "100%", gap: "10px" }}>
        <span>Template</span>
        <textarea
          style={{ width: "100%", height: "calc(100% - 30px)" }}
          value={template}
          onChange={(e) => {
            setTemplate(e.currentTarget.value);
            setSheet(createSheet(data, e.currentTarget.value));
          }}
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
        <button
          disabled={sheet?.type !== "Ok"}
          onClick={() => {
            if (sheet?.type === "Ok") {
              FileSaver.saveAs(new Blob([toXlsx(sheet.sheet)], { type: "text/plain" }), `abstract-visuals.xlsx`);
            }
          }}
        >
          Download Xlsx
        </button>
        {sheet?.type === "Err" ? (
          <h3>{sheet.error}</h3>
        ) : (
          <pre style={{ width: "100%", height: "calc(100% - 30px)" }}>
            {sheet?.type === "Ok"
              ? toCsv(sheet.sheet)
                  .map((s) => s.csv)
                  .join("\n\n")
              : ""}
          </pre>
        )}
      </div>
    </div>
  );
}

function createSheet(
  data: string,
  template: string
): { type: "Ok"; sheet: AbstractSheet } | { type: "Err"; error: string } {
  let dataObject = {};
  try {
    dataObject = JSON.parse(data);
  } catch (e) {
    return { type: "Err", error: "Failed to parse JSON." };
  }
  const mustacheResolvedXml = render(template, dataObject, {});
  const validationErrors = validateXml(mustacheResolvedXml, parsedXsd);
  if (validationErrors.length > 0) {
    return { type: "Err", error: errorToReadableText(validationErrors, "template") };
  }
  try {
    return { type: "Ok", sheet: abstractSheetXml(parseXml(mustacheResolvedXml)[0]!) as AbstractSheet };
  } catch (e) {
    return { type: "Err", error: e.message };
  }
}
