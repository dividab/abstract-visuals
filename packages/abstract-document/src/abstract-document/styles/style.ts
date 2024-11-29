import * as ParagraphStyle from "./paragraph-style.js";
import * as TableCellStyle from "./table-cell-style.js";
import * as TableStyle from "./table-style.js";
import * as TextStyle from "./text-style.js";

export type Style =
  | ParagraphStyle.ParagraphStyle
  | TableCellStyle.TableCellStyle
  | TableStyle.TableStyle
  | TextStyle.TextStyle;

export function overrideWith(overrider: Style | undefined, toOverride: Style | undefined): Style | undefined {
  if (!overrider) {
    return toOverride;
  }
  if (!toOverride) {
    return overrider;
  }
  if (overrider.type === "ParagraphStyle" && toOverride.type === "ParagraphStyle") {
    return ParagraphStyle.overrideWith(overrider, toOverride);
  } else if (overrider.type === "TableCellStyle" && toOverride.type === "TableCellStyle") {
    return TableCellStyle.overrideWith(overrider, toOverride);
  } else if (overrider.type === "TableStyle" && toOverride.type === "TableStyle") {
    return TableStyle.overrideWith(overrider, toOverride);
  } else if (overrider.type === "TextStyle" && toOverride.type === "TextStyle") {
    return TextStyle.overrideWith(overrider, toOverride);
  }
  return toOverride;
}
