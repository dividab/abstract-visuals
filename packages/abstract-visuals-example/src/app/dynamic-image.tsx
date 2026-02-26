import React from "react";
import wiringPng from "../../assets/wiring.png";
import FileSaver from "file-saver";
import { compileDynamicImage, renderDynamicImage } from "../../../abstract-image/src/dynamic-image/dynamic-image.js";
import { createSVG, ReactSvg } from "../../../abstract-image/src/exporters/index.js";
import { generateDataSchema } from "../../../abstract-image/src/dynamic-image/utils.js";
import { PropertySchema } from "jsxpression";
import { FunctionSchema } from "../../../jsxpression/src/schema.js";

export function DynamicImage({}: {}): React.JSX.Element {
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

  const schema: Record<string, PropertySchema> = generateDataSchema(dataParsed);
  const funcSchema: Record<string, FunctionSchema> = {
    test: {
      ret: { type: "string" },
      args: [
        {
          name: "str",
          property: { type: "string" },
        }
      ]
    }
  }

  const functions: Record<string, Function> = {
    test: (str: string): string => `0x${str.length.toString(16)}`,
  }

  const jsString = compileDynamicImage(template, schema, funcSchema, true);
  const rendered = jsString.type === "Ok" ? renderDynamicImage(jsString.value, dataParsed, functions) : undefined;
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
            disabled={rendered?.type !== "Ok"}
            onClick={() => {
              if (rendered?.type === "Ok") {
                FileSaver.saveAs(new Blob([createSVG(rendered.image)], { type: "image/svg+xml" }), "template-svg.svg");
              }
            }}
          >
            Download Svg
          </button>
        </div>
        {rendered?.type === "Ok" ? (
          <ReactSvg image={rendered.image} />
        ) : jsString.type === "Err" ? (
          jsString.error.message
        ) : (
          rendered?.error?.message ?? ""
        )}
        {/* <div dangerouslySetInnerHTML={{ __html: svg }} /> */}
      </div>
    </div>
  );
}
