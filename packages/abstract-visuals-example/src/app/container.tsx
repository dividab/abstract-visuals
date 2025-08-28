import React from "react";
import { Abstract3DExample } from "./abstract-3d-example.js";
import { AbstractImageExampleReact } from "./abstract-image-example-react.js";
import { AbstractImageExampleDxf } from "./abstract-image-example-dxf.js";
import { AbstractImageExampleSvg } from "./abstract-image-example-svg.js";
import { AbstractChartExample } from "./abstract-chart-example.js";
import { AbstractDocumentExample } from "./abstract-document-example.js";
import { AbstractDocumentXMLExample } from "./abstract-document-xml-example.js";
import { AbstractSheetExample } from "./abstract-sheet-example.js";
import { AbstractSheetXMLExample } from "./abstract-sheet-xml-example.js";
import { AbstractImageXml } from "./dynamic-image.js";

type Example = (typeof examples)[number];

const examples = [
  "AbstractImageSvg",
  "AbstractImageReact",
  "AbstractImageDxf",
  "AbstractChart",
  "AbstractDocument",
  "AbstractDocumentXML",
  "Abstract3D",
  "AbstractSheet",
  "AbstractSheetXML",
  "AbstractImageXML",
] as const;

export function Container(): React.JSX.Element {
  const [selected, setSelected] = React.useState((): Example => {
    const fromStorage = localStorage.getItem("selected") as Example;
    return fromStorage && examples.includes(fromStorage) ? fromStorage : examples[0];
  });

  return (
    <div style={{ height: "calc(100vh - 30px)", width: "calc(100vw - 30px)" }}>
      <select
        value={selected}
        onChange={(e) => {
          localStorage.setItem("selected", e.currentTarget.value);
          setSelected(e.currentTarget.value as Example);
        }}
      >
        {examples.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>
      {(() => {
        switch (selected) {
          case "AbstractChart":
            return <AbstractChartExample />;
          case "AbstractImageSvg":
            return <AbstractImageExampleSvg />;
          case "AbstractImageReact":
            return <AbstractImageExampleReact />;
          case "AbstractImageDxf":
            return <AbstractImageExampleDxf />;
          case "AbstractDocument":
            return <AbstractDocumentExample />;
          case "AbstractDocumentXML":
            return <AbstractDocumentXMLExample />;
          case "Abstract3D":
            return <Abstract3DExample />;
          case "AbstractSheet":
            return <AbstractSheetExample />;
          case "AbstractSheetXML":
            return <AbstractSheetXMLExample />;
          case "AbstractImageXML":
            return <AbstractImageXml />;
          default:
            return <></>;
        }
      })()}
    </div>
  );
}
