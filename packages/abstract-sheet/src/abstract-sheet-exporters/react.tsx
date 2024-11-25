import React from "react";
import { AbstractSheet, BorderStyle, Style } from "../abstract-sheet/abstract-sheet";

export function toReact({ abstractSheet }: { readonly abstractSheet: AbstractSheet }): JSX.Element {
  const styles = React.useMemo(
    () => Object.fromEntries(abstractSheet.styles?.map((s) => [s.name, s]) ?? []),
    [abstractSheet.styles]
  );

  return (
    <div className="abstract-sheet">
      {abstractSheet.sheets.map((s, si) => {
        const maxCols = s.cells.reduce((a, c) => Math.max(a, c.length), 0);
        const colArray = Array.from({ length: maxCols }, (_, i) => i);
        return (
          <div
            className={`sheet sheet-${si} sheet-${s.name}`}
            key={s.name}
            style={{
              display: "grid",
              width: "max-content",
              height: "max-content",
              border: "1px solid rgb(200,200,200)",
              gridTemplateRows: `${(s.direction === "col" ? colArray : s.cells)
                .map((_, ri) => {
                  const info = s.rowInfo?.[ri];
                  return info?.hidden
                    ? ""
                    : info?.heightPixels !== undefined
                    ? `${info.heightPixels}px`
                    : "minmax(18px, max-content)";
                })
                .join(" ")}`,
              gridTemplateColumns: `${(s.direction === "col" ? s.cells : colArray)
                .map((_, ci) => {
                  const co = s.colInfo?.[ci];
                  return co?.hidden
                    ? ""
                    : co?.widthPixels !== undefined
                    ? `${co.widthPixels}px`
                    : "minmax(64px, max-content)";
                })
                .join(" ")}`,
            }}
          >
            {s.cells.map((cells, cellsIdx) => (
              <div
                key={cellsIdx}
                className={`cells cells-${cellsIdx}`}
                style={{
                  display: "grid",
                  ...(s.direction === "col"
                    ? { gridTemplateRows: `subgrid`, gridRow: "1 / -1" }
                    : { gridTemplateColumns: `subgrid`, gridColumn: "1 / -1" }),
                }}
              >
                {Array.from({ length: maxCols }, (_, i) => i).map((ci) => {
                  const c = cells[ci];
                  let s: Partial<Style> = {};
                  if (c?.styles !== undefined) {
                    for (const style of c.styles) {
                      s = { ...s!, ...styles[style] };
                    }
                  }
                  return (
                    <div
                      className={`cell cell-${ci} cell-${c?.type}`}
                      key={ci}
                      style={{
                        padding: "1px",
                        background: s.foreground,
                        justifyContent:
                          s.horizontal === "right"
                            ? "end"
                            : s.horizontal === "left"
                            ? "start"
                            : s.horizontal === "center"
                            ? "center"
                            : c?.type === "number"
                            ? "end"
                            : "start",
                        display: "flex",
                        alignItems:
                          s.vertical === "top"
                            ? "start"
                            : s.vertical === "bottom"
                            ? "end"
                            : s.vertical === "center"
                            ? "center"
                            : c?.type === "number"
                            ? "end"
                            : "center ",
                        borderTop: `${borderWidth(
                          s.borderStyle?.top ?? (s.borderColor?.top ? "medium" : undefined)
                        )} ${borderStyle(s.borderStyle?.top)} ${
                          s.borderColor?.top ?? s.foreground ?? "rgb(200,200,200)"
                        } `,
                        borderRight: `${borderWidth(
                          s.borderStyle?.right ?? (s.borderColor?.right ? "medium" : undefined)
                        )} ${borderStyle(s.borderStyle?.right)} ${
                          s.borderColor?.right ?? s.foreground ?? "rgb(200,200,200)"
                        } `,
                        borderBottom: `${borderWidth(
                          s.borderStyle?.bottom ?? (s.borderColor?.bottom ? "medium" : undefined)
                        )} ${borderStyle(s.borderStyle?.bottom)} ${
                          s.borderColor?.bottom ?? s.foreground ?? "rgb(200,200,200)"
                        } `,
                        borderLeft: `${borderWidth(
                          s.borderStyle?.left ?? (s.borderColor?.left ? "medium" : undefined)
                        )} ${borderStyle(s.borderStyle?.left)} ${
                          s.borderColor?.left ?? s.foreground ?? "rgb(200,200,200)"
                        } `,
                      }}
                    >
                      <div
                        className={`value value-${ci} value-${c?.type}`}
                        style={{
                          fontFamily: "calibri",
                          textDecoration: [s.strike ? "line-through" : "", s.underline ? "underline" : ""].join(" "),
                          fontWeight: s.bold ? "bold" : undefined,
                          fontStyle: s.italic ? "italic" : undefined,
                          fontSize: `${s.size ?? 11}px`,
                          lineHeight: `${s.size ?? 11}px`,
                          height: `${s.size ?? 11}px`,
                          color: s.color ? s.color : undefined,
                          transform: s.textRotation ? `rotate(${s.textRotation})` : undefined,
                        }}
                      >
                        {typeof c?.value === "object" ? c.value.toISOString() : c?.value ?? ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function borderWidth(border: BorderStyle | undefined): string {
  switch (border) {
    case "hair":
    case "thin":
    default:
    case undefined:
      return "1px";
    case "thick":
      return "3px";
    case "mediumDashDot":
    case "mediumDashDotDot":
    case "mediumDashed":
    case "dotted":
    case "dashDotDot":
    case "slantDashDot":
    case "dashed":
    case "dashDot":
    case "medium":
      return "2px";
  }
}

function borderStyle(border: BorderStyle | undefined): string {
  switch (border) {
    case "dashDot":
    case "mediumDashDot":
    case "mediumDashDotDot":
    case "mediumDashed":
    case "dashDotDot":
    case "slantDashDot":
    case "dashed":
      return "dashed";
    case "hair":
    case "dotted":
      return "dotted";
    case undefined:
    case "medium":
    case "thick":
    case "thin":
    default:
      return "solid";
  }
}
