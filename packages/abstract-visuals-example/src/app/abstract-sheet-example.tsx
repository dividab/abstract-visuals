import * as React from "react";
import FileSaver from "file-saver";
import * as AS from "../../../abstract-sheet";

export function AbstractSheetExample(): JSX.Element {
  const as: AS.AbstractSheet = {
    sheets: [
      {
        name: "sheet1",
        cells: [
          [
            { type: "number", value: 1 },
            { type: "number", value: 1, styles: ["yellow"] },
            { type: "number", value: 2 },
            { type: "number", value: 3 },
            { type: "number", value: 1, styles: ["yellow"] },
          ],
          [
            { type: "number", value: 1 },
            { type: "number", value: 21, styles: ["red"] },
            { type: "number", value: 2 },
            { type: "number", value: 5 },
            { type: "number", value: 1 },
          ],
        ],
        colInfo: [],
        rowInfo: [],
      },
    ],
    styles: [
      { name: "red", bold: true, italic: true, foreground: "FFFFAA00" },
      { name: "yellow", color: "FFFFAA00" },
    ],
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", height: "20px", background: "rgb(251,  251, 251)" }}>
        <button
          onClick={() => {
            for (const f of AS.toCsv(as)) {
              FileSaver.saveAs(new Blob([f.csv], { type: "text/plain" }), `${f.name}.txt`);
            }
          }}
        >
          csv
        </button>
        <button
          onClick={() => FileSaver.saveAs(new Blob([AS.toXlsx(as)], { type: "text/plain" }), `abstract-visuals.xlsx`)}
        >
          xlsx
        </button>
      </div>
    </div>
  );
}
