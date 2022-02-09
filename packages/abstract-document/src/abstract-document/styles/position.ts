import * as SectionElement from "../section-elements/section-element";

export type Position = "absolute" | "relative";

export function isPositionAbsolute(element: SectionElement.SectionElement): boolean {
  const elementStyle = SectionElement.getSectionStyle(element);
  return elementStyle?.position === "absolute";
}
