export type TextAlignment = "left" | "center" | "right" | "justify";

export interface TextStyle {
  readonly type: "TextStyle";
  readonly fontFamily?: string;
  readonly bold?: boolean;
  readonly mediumBold?: boolean;
  readonly color?: string;
  readonly fontSize?: number;
  readonly fontScale?: number;
  readonly italic?: boolean;
  readonly subScript?: boolean;
  readonly superScript?: boolean;
  readonly underline?: boolean;
  readonly verticalPosition?: number;
  readonly indent?: number;
  readonly lineGap?: number;
}

export interface TextStyleProps {
  readonly fontFamily?: string;
  readonly bold?: boolean;
  readonly mediumBold?: boolean;
  readonly color?: string;
  readonly fontSize?: number;
  readonly fontScale?: number;
  readonly italic?: boolean;
  readonly subScript?: boolean;
  readonly superScript?: boolean;
  readonly underline?: boolean;
  readonly verticalPosition?: number;
  readonly indent?: number;
  readonly lineGap?: number;
}

export function create(props?: TextStyleProps): TextStyle {
  return {
    type: "TextStyle",
    ...(props || {}),
  };
}

export function overrideWith(overrider: TextStyle | undefined, toOverride: TextStyle | undefined): TextStyle {
  const a: TextStyleProps = overrider || {};
  const b: TextStyleProps = toOverride || {};
  return create({
    fontFamily: a.fontFamily || b.fontFamily,
    bold: a.bold || b.bold,
    mediumBold: a.mediumBold || b.mediumBold,
    color: a.color || b.color,
    fontSize: a.fontSize || b.fontSize,
    fontScale: a.fontScale || b.fontScale,
    italic: a.italic || b.italic,
    subScript: a.subScript || b.subScript,
    superScript: a.superScript || b.superScript,
    underline: a.underline || b.underline,
    verticalPosition: a.verticalPosition || b.verticalPosition,
    indent: a.indent || b.indent,
    lineGap: a.lineGap || b.lineGap,
  });
}

export function calculateFontSize(textStyle: TextStyle | undefined, defaultFontSize: number): number {
  const fontSize = textStyle && textStyle.fontSize ? textStyle.fontSize : defaultFontSize;
  const fontScale = textStyle && textStyle.fontScale ? textStyle.fontScale : 1.0;
  return fontSize * fontScale;
}
