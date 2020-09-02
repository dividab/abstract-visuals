import * as LayoutFoundation from "../primitives/layout-foundation";

export type PageOrientation = "Portrait" | "Landscape";
export type PaperSize = "A4" | "Letter";

export interface PageStyle {
  readonly headerMargins: LayoutFoundation.LayoutFoundation;
  readonly footerMargins: LayoutFoundation.LayoutFoundation;
  readonly contentMargins: LayoutFoundation.LayoutFoundation;
  readonly orientation: PageOrientation;
  readonly paperSize: PaperSize;
  readonly noTopBottomMargin: boolean;
}

export interface PageStyleProps {
  readonly headerMargins?: LayoutFoundation.LayoutFoundation;
  readonly footerMargins?: LayoutFoundation.LayoutFoundation;
  readonly contentMargins?: LayoutFoundation.LayoutFoundation;
  readonly orientation?: PageOrientation;
  readonly paperSize?: PaperSize;
  readonly noTopBottomMargin?: boolean;
}

export function create(props?: PageStyleProps): PageStyle {
  const {
    headerMargins = LayoutFoundation.create(),
    footerMargins = LayoutFoundation.create(),
    contentMargins = LayoutFoundation.create(),
    orientation = "Portrait",
    paperSize = "A4",
    noTopBottomMargin = false
  } =
    props || {};
  return {
    headerMargins,
    footerMargins,
    contentMargins,
    orientation,
    paperSize,
    noTopBottomMargin
  };
}

export function getWidth(pageStyle: PageStyle): number {
  return pageStyle.orientation === "Landscape"
    ? getPaperHeight(pageStyle.paperSize)
    : getPaperWidth(pageStyle.paperSize);
}

export function getHeight(pageStyle: PageStyle): number {
  return pageStyle.orientation === "Landscape"
    ? getPaperWidth(pageStyle.paperSize)
    : getPaperHeight(pageStyle.paperSize);
}

export function getPaperWidth(ps: PaperSize): number {
  switch (ps) {
    case "A4":
      return 595;
    case "Letter":
      return 612;
    default:
      throw new Error("Unknown paper size");
  }
}

export function getPaperHeight(ps: PaperSize): number {
  switch (ps) {
    case "A4":
      return 842;
    case "Letter":
      return 792;
    default:
      throw new Error("Unknown paper size");
  }
}
