import React from "react";
import { Abstract3DAutoSizeExample } from "./abstract-3d-autosize-example.js";
import { Abstract3DExample } from "./abstract-3d-example.js";
import { AbstractChartExample } from "./abstract-chart-example.js";
import { AbstractDocumentExample } from "./abstract-document-example.js";
import { AbstractDocumentXMLExample2 } from "./abstract-document-xml-example-2.js";
import { AbstractDocumentXMLExample } from "./abstract-document-xml-example.js";
import { AbstractImageExampleDxf } from "./abstract-image-example-dxf.js";
import { AbstractImageExampleReact } from "./abstract-image-example-react.js";
import { AbstractImageExampleSvg } from "./abstract-image-example-svg.js";
import { AbstractSheetExample } from "./abstract-sheet-example.js";
import { AbstractSheetXMLExample } from "./abstract-sheet-xml-example.js";
import { DynamicImage } from "./dynamic-image.js";
import type { Theme } from "./theme.js";
import { ThemeContext } from "./theme.js";

type Example = (typeof examples)[number];

const examples = [
  "AbstractImageSvg",
  "AbstractImageReact",
  "AbstractImageDxf",
  "AbstractChart",
  "AbstractDocument",
  "AbstractDocumentXML",
  "AbstractDocumentXML2",
  "Abstract3D",
  "Abstract3DAutoSize",
  "AbstractSheet",
  "AbstractSheetXML",
  "DynamicImage",
] as const;

export function Container(): React.JSX.Element {
  const [selected, setSelected] = React.useState((): Example => {
    const fromStorage = localStorage.getItem("selected");
    return fromStorage !== null && examples.includes(fromStorage as Example) ? (fromStorage as Example) : examples[0];
  });
  const [theme, setTheme] = React.useState((): Theme => (localStorage.getItem("theme") === "dark" ? "dark" : "light"));

  // On the root element, so the page's CSS variables and native controls follow it
  React.useLayoutEffect(() => {
    document.documentElement.dataset["theme"] = theme;
  }, [theme]);

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
      <label style={{ marginLeft: 12 }}>
        Theme:
        <select
          value={theme}
          onChange={(e) => {
            localStorage.setItem("theme", e.currentTarget.value);
            setTheme(e.currentTarget.value as Theme);
          }}
          style={{ marginLeft: 8 }}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <ThemeContext.Provider value={theme}>
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
            case "AbstractDocumentXML2":
              return <AbstractDocumentXMLExample2 />;
            case "Abstract3D":
              return <Abstract3DExample />;
            case "Abstract3DAutoSize":
              return <Abstract3DAutoSizeExample />;
            case "AbstractSheet":
              return <AbstractSheetExample />;
            case "AbstractSheetXML":
              return <AbstractSheetXMLExample />;
            case "DynamicImage":
              return <DynamicImage />;
            default:
              return <></>;
          }
        })()}
      </ThemeContext.Provider>
    </div>
  );
}
