import FileSaver from "file-saver";
import React from "react";
import { compileDynamicImage, renderDynamicImage } from "../../../abstract-image/src/dynamic-image/dynamic-image.js";
import { generateDataSchema } from "../../../abstract-image/src/dynamic-image/utils.js";
import { createSVG, ReactSvg } from "../../../abstract-image/src/exporters/index.js";
// TEMP: Direct src import for dev
import type { FunctionSchema, PropertySchema } from "../../../jsxpression/src/schema.js";
import wiringPng from "../../assets/wiring.png";

export function DynamicImage({}: {}): React.JSX.Element {
  const [data, setData] = React.useState(
    JSON.stringify(
      {
        imageUrl: wiringPng,
        property1: 23.4,
        design_spec2: 12,
        title: "Wiring Diagram",
        measurements: [
          { label: "Voltage", value: 230, unit: "V", ok: true },
          { label: "Current", value: 4.8, unit: "A", ok: true },
          { label: "Resistance", value: 48, unit: "Ω", ok: false },
        ],
        warning: "Check R3 connection",
      },
      undefined,
      2
    )
  );

  const [template, setTemplate] = React.useState(`const colWidth = 170
const rowHeight = 22
const startY = 80

interface BadgeProps {
  x: number
  y: number
  text: string
  color: string
}

function Badge({x, y, text, color}: BadgeProps) {
  return <Group>
    <Rectangle x={x} y={y} width={text.length * 8 + 16} height={20} fill={color} radius={4} />
    <Text x={x + 8} y={y + 14} fontSize={11} fontWeight="bold" fill="#ffffff">{text}</Text>
  </Group>
}

interface Measurement {
  label: string
  value: number
  unit: string
  ok: boolean
}

interface MeasurementRowProps {
  x: number
  y: number
  item: Measurement
  index: number
}

function MeasurementRow({x, y, item, index}: MeasurementRowProps) {
  const bg = index % 2 === 0 ? "#f8f9fa" : "#ffffff"
  return <Group>
    <Rectangle x={x} y={y} width={colWidth} height={rowHeight} fill={bg} stroke="#dee2e6" strokeWidth={1} />
    <Text x={x + 8} y={y + 16} fontSize={12} fill="#495057">{item.label}</Text>
    <Text x={x + 90} y={y + 16} fontSize={12} fontWeight="bold" fill="#212529">{String(item.value)}</Text>
    <Text x={x + 130} y={y + 16} fontSize={10} fill="#868e96">{item.unit}</Text>
    <Badge x={x + colWidth + 4} y={y + 2} text={item.ok ? "OK" : "FAIL"} color={item.ok ? "#2b8a3e" : "#e03131"} />
  </Group>
}

return <AbstractImage width={600} height={260}>
  <Rectangle x={0} y={0} width={600} height={260} fill="#f1f3f5" />

  <Image src={imageUrl} x={10} y={10} width={180} height={140} />

  <Rectangle x={200} y={8} width={390} height={30} fill="#1864ab" radius={4} />
  <Text x={210} y={28} fontSize={16} fontWeight="bold" fill="#ffffff">{title}</Text>

  <Text x={200} y={62} fontSize={11} fill="#868e96">MEASUREMENTS</Text>
  <Line x1={200} y1={68} x2={420} y2={68} stroke="#dee2e6" strokeWidth={1} />

  {measurements.map((item, i) =>
    <MeasurementRow x={200} y={startY + i * rowHeight} item={item} index={i} />
  )}

  <Rectangle x={200} y={startY + measurements.length * rowHeight + 12} width={390} height={24} fill="#fff3bf" stroke="#f59f00" strokeWidth={1} radius={3} />
  <Text x={212} y={startY + measurements.length * rowHeight + 28} fontSize={11} fill="#e67700">⚠ {warning}</Text>

  <Text x={10} y={180} fontSize={20} fontWeight="bold" fill="#1864ab">{String(property1)}</Text>
  <Text x={10} y={195} fontSize={10} fill="#868e96">Property 1</Text>

  <Text x={100} y={180} fontSize={20} fontWeight="bold" fill="#1864ab">{String(design_spec2)}</Text>
  <Text x={100} y={195} fontSize={10} fill="#868e96">Design Spec</Text>

  <Line x1={10} y1={210} x2={190} y2={210} stroke="#1864ab" strokeWidth={2} />
  <Text x={10} y={230} fontSize={9} fill="#adb5bd">Generated from template • {String(measurements.length)} measurements</Text>
</AbstractImage>`);

  let dataParsed = {};
  try {
    dataParsed = JSON.parse(data);
  } catch (e) {
    console.log(e);
  }

  const schema = generateDataSchema(dataParsed as Record<string, unknown>);

  const funcSchema: Record<string, FunctionSchema> = {
    test: {
      returnType: { type: "string" },
      parameters: [
        {
          name: "str",
          property: { type: "string" },
        },
      ],
    },
  };

  const functions: Record<string, Function> = {
    test: (str: string): string => `0x${str.length.toString(16)}`,
  };

  const jsString = compileDynamicImage(template, schema, funcSchema, false);
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
                FileSaver.saveAs(
                  new Blob([createSVG(rendered.image)], {
                    type: "image/svg+xml",
                  }),
                  "template-svg.svg"
                );
              }
            }}
          >
            Download Svg
          </button>
        </div>
        {rendered?.type === "Ok" ? (
          <ReactSvg image={rendered.image} />
        ) : jsString.type === "Err" ? (
          <div style={{ color: "#e03131", fontSize: 13, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
            <div style={{ fontWeight: "bold", marginBottom: 8 }}>{jsString.error.message}</div>
            {jsString.error.issues?.map((issue, i) => (
              <div key={i} style={{ padding: "2px 0" }}>
                • [{issue.code}] {issue.message}
              </div>
            ))}
          </div>
        ) : (
          rendered?.error?.message ?? ""
        )}
        {/* <div dangerouslySetInnerHTML={{ __html: svg }} /> */}
      </div>
    </div>
  );
}
