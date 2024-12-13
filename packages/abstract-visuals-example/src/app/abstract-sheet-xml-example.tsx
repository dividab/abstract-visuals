/* eslint-disable @typescript-eslint/no-misused-promises */
import React from "react";
import * as AS from "../../../abstract-sheet/src/index.js";
import FileSaver from "file-saver";

export function AbstractSheetXMLExample(): React.JSX.Element {
  const [data, setData] = React.useState('{ "test": "Hello world", "truthy": true, "falsy": false }');
  const [template, setTemplate] = React.useState(`<AbstractSheet>
  <Styles>
    <Style name="boldText" size="12" bold="true" horizontal="left"/>
    <Style name="yellowBackground" foreground="#FFAA00"/>
    <Style name="blueBorder" borderColor="#0000FF"/>
    <Style name="border" size="16" borderStyle="dotted" borderColor="#FF0000"/>
  </Styles>
  <Sheet name="sheet1" direction="row">
    <Cells>
      <Cell number="4" />
      <Cell text="24" styles="boldText"/>
      <Cell number="4" styles="boldText"/>
      <Cell number="4"/>
      <Cell number="4" />
      <Cell number="4"/>
    </Cells>
    <Cells>
      <Cell number="4" />
      <Cell text="24"/>
      <Cell number="4" styles="border" />
      <Cell number="4"/>
      <Cell number="4" styles="blueBorder"/>
      <Cell number="4"/>
      <Cell number="4" />
      <Cell number="4"/>
    </Cells>
    <Cells>
      <Cell number="4" />
      <Cell text="24" styles="boldText"/>
      <Cell number="4" styles="boldText"/>
      <Cell number="4"/>
      <Cell number="4" />
      <Cell number="4"/>
    </Cells>
    <Cells>
      <Cell number="0" styles="yellowBackground"/>
      <Cell number="4" />
      <Cell number="1" />
      <Cell number="4" styles="yellowBackground,boldText"/>
      <Cell number="4" />
      {{#truthy}}
      <Cell text="rendered"/>
      {{/truthy}}
      {{#falsy}}
      <Cell text="not rendered:"/>
      {{/falsy}}
    </Cells>
    <ColInfos>
       <ColInfo />
       <ColInfo />
       <ColInfo widthPixels="70" />
    </ColInfos>
    <RowInfos>
       <RowInfo />
       <RowInfo />
       <RowInfo heightPixels="45" />
    </RowInfos>
  </Sheet>
</AbstractSheet>`);

  const [sheet, setSheet] = React.useState<
    { type: "Ok"; sheet: AS.AbstractSheet } | { type: "Err"; error: string } | undefined
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
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            disabled={sheet?.type !== "Ok"}
            onClick={() => {
              if (sheet?.type === "Ok") {
                FileSaver.saveAs(new Blob([AS.toXlsx(sheet.sheet)], { type: "text/plain" }), `abstract-visuals.xlsx`);
              }
            }}
          >
            Download Xlsx
          </button>
          <button
            disabled={sheet?.type !== "Ok"}
            onClick={() => {
              if (sheet?.type === "Ok") {
                FileSaver.saveAs(
                  new Blob(
                    [
                      AS.toCsv(sheet.sheet)
                        .map((s) => s.csv)
                        .join("\n\n"),
                    ],
                    { type: "text/plain" }
                  ),
                  `abstract-visuals.txt`
                );
              }
            }}
          >
            Download Csv
          </button>
        </div>

        {sheet?.type === "Err" ? (
          <h3>{sheet.error}</h3>
        ) : (
          <div style={{ width: "100%", height: "calc(100% - 30px)" }}>
            {sheet?.type === "Ok" ? <AS.toReact abstractSheet={sheet.sheet} /> : ""}
          </div>
        )}
      </div>
    </div>
  );
}

function createSheet(
  data: string,
  template: string
): { type: "Ok"; sheet: AS.AbstractSheet } | { type: "Err"; error: string } {
  let dataObject = {};
  try {
    dataObject = JSON.parse(data);
  } catch (e) {
    return { type: "Err", error: "Failed to parse JSON." };
  }
  const mustacheRendered = AS.render(template, dataObject, {});
  const validationErrors = AS.validateXml(mustacheRendered, AS.parsedXsd);
  if (validationErrors.length > 0) {
    return { type: "Err", error: AS.errorToReadableText(validationErrors, "template") };
  }
  try {
    return { type: "Ok", sheet: AS.abstractSheetOfXml(AS.parseXml(mustacheRendered)[0]!) as AS.AbstractSheet };
  } catch (e) {
    return { type: "Err", error: e.message };
  }
}
