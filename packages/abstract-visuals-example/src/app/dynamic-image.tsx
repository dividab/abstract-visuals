import React from "react";
import wiringPng from "../../assets/wiring.png";
import FileSaver from "file-saver";
import { dynamicImage } from "../../../abstract-image/src/dynamic-image/dynamic-image.js";
import { createSVG, ReactSvg } from "../../../abstract-image/src/exporters/index.js";

export function AbstractImageXml({}: {}): React.JSX.Element {
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

  const [template, setTemplate] = React.useState(`<AbstractImage width={600} height={200}>
  <Text x={20} y={20} fontSize="32">{data.property1}</Text>
  <Image src={data.imageUrl} x={0} y={0} width={200} height={400}/>
</AbstractImage>`);

  let dataParsed = {};
  try {
    dataParsed = JSON.parse(data);
  } catch (e) {
    console.log(e);
  }
  const result = dynamicImage(template, dataParsed);
  console.log("ai", result);

  return (
    <div
      style={{
        display: "flex",
        margin: "10px 0 0 10px",
        gap: "10px",
        width: "100%",
        height: "calc(100% - 40px)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "20%",
          height: "100%",
          gap: "10px",
        }}
      >
        <span>Data</span>
        <textarea
          style={{ width: "100%", height: "calc(100% - 30px)" }}
          value={data}
          onChange={(e) => setData(e.currentTarget.value)}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "39%",
          height: "100%",
          gap: "10px",
        }}
      >
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
          <button
            disabled={result.type !== "Ok"}
            onClick={() => {
              if (result.type === "Ok") {
                FileSaver.saveAs(new Blob([createSVG(result.image)], { type: "image/svg+xml" }), "template-svg.svg");
              }
            }}
          >
            Download Svg
          </button>
        </div>
        {result.type === "Ok" ? <ReactSvg image={result.image} /> : result.error.message}
        {/* <div dangerouslySetInnerHTML={{ __html: svg }} /> */}
      </div>
    </div>
  );
}
