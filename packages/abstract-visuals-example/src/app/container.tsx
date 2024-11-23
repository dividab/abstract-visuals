import * as React from "react";
import { AbstractImageExampleReact } from "./abstract-image-example-react";
import { Abstract3DExample } from "./abstract-3d-example";
import { AbstractImageExampleDxf } from "./abstract-image-example-dxf";
import { AbstractChartExample } from "./abstract-chart-example";
import { AbstractDocumentExample } from "./abstract-document-example";
import { AbstractDocumentXMLExample } from "./abstract-document-xml-example";
import { AbstractImageExampleSvg } from "./abstract-image-example-svg";
import { AbstractSheetExample } from "./abstract-sheet-example";
import { AbstractSheetXMLExample } from "./abstract-sheet-xml-example";

type Example = (typeof examples)[number];

const examples = [
  "AbstractChart",
  "AbstractImageSvg",
  "AbstractImageReact",
  "AbstractImageDxf",
  "AbstractDocument",
  "AbstractDocumentXML",
  "Abstract3D",
  "AbstractSheet",
  "AbstractSheetXML",
] as const;

export function Container(): JSX.Element {
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
          default:
            return <></>;
        }
      })()}
    </div>
  );
}
