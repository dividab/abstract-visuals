import React from "react";
import Handlebars from "handlebars";
import wiringPng from "../../assets/wiring.png";
import FileSaver from "file-saver";

export function TemplateSVG({}: {}): React.JSX.Element {
  const [data, setData] = React.useState(
    JSON.stringify(
      {
        imageUrl: wiringPng,
        property1: 23.4,
        design_spec2: 12,
      },
      undefined,
      2
    )
  );

  const [template, setTemplate] = React.useState(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
  <image href="{{imageUrl}}" x="0" y="0" width="400" height="600" />
  <text x="240" y="171" text-anchor="middle" font-family="Inter, Arial" fill="blue" font-size="8">{{property1}}</text>
  <text x="187" y="368" text-anchor="middle" font-family="Inter, Arial" font-size="14">{{design_spec2}}</text>
</svg>`);

  let dataParsed = {};
  try {
    dataParsed = JSON.parse(data);
  } catch (e) {
    console.log(e);
  }
  const svg = Handlebars.compile(template, { compat: true, preventIndent: true })(dataParsed);
  return (
    <div style={{ display: "flex", margin: "10px 0 0 10px", gap: "10px", width: "100%", height: "calc(100% - 40px)" }}>
      <div style={{ display: "flex", flexDirection: "column", width: "20%", height: "100%", gap: "10px" }}>
        <span>Data</span>
        <textarea
          style={{ width: "100%", height: "calc(100% - 30px)" }}
          value={data}
          onChange={(e) => setData(e.currentTarget.value)}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: "39%", height: "100%", gap: "10px" }}>
        <span>Template</span>
        <textarea
          style={{ width: "100%", height: "calc(100% - 30px)" }}
          value={template}
          onChange={(e) => {
            setTemplate(e.currentTarget.value);
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
          <button onClick={() => FileSaver.saveAs(new Blob([svg], { type: "text/plain" }), `template-svg.svg`)}>
            Download Svg
          </button>
        </div>
        <div dangerouslySetInnerHTML={{ __html: svg }} />;
      </div>
    </div>
  );
}
