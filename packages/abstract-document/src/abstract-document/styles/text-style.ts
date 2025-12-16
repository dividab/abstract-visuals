export type TextBaseline = "top" | "bottom" | "middle" | "alphabetic" | "hanging";
export type TextFontWeight = "light" | "normal" | "mediumBold" | "bold" | "extraBold";

export interface TextStyle {
  readonly type: "TextStyle";
  readonly fontFamily?: string;
  readonly light?: boolean;
  readonly normal?: boolean;
  readonly bold?: boolean;
  readonly mediumBold?: boolean;
  readonly extraBold?: boolean;
  readonly fontWeight?: TextFontWeight;
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
  readonly lineBreak?: boolean;
  readonly baseline?: TextBaseline;
  readonly strike?: boolean;
  readonly opacity?: number;
  readonly characterSpacing?: number;
}

export interface TextStyleProps {
  readonly fontFamily?: string;
  readonly light?: boolean;
  readonly normal?: boolean;
  readonly bold?: boolean;
  readonly mediumBold?: boolean;
  readonly extraBold?: boolean;
  readonly fontWeight?: TextFontWeight;
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
  readonly lineBreak?: boolean;
  readonly baseline?: TextBaseline;
  readonly strike?: boolean;
  readonly opacity?: number;
  readonly characterSpacing?: number;
}

export function create(props?: TextStyleProps): TextStyle {
  return {
    type: "TextStyle",
    ...(props || {}),
  };
}

export function overrideWith(overrider: TextStyle | undefined, toOverride: TextStyle | undefined): TextStyle {
  const overriddenFontWeight: Partial<TextStyle> =
    overrider?.light ||
      overrider?.normal ||
      overrider?.mediumBold ||
      overrider?.bold ||
      overrider?.extraBold ||
      overrider?.fontWeight
      ? {
        light: overrider?.light,
        normal: overrider?.normal,
        mediumBold: overrider?.mediumBold,
        bold: overrider?.bold,
        extraBold: overrider?.extraBold,
        fontWeight: overrider?.fontWeight,
      }
      : {
        light: toOverride?.light,
        normal: toOverride?.normal,
        mediumBold: toOverride?.mediumBold,
        bold: toOverride?.bold,
        extraBold: toOverride?.extraBold,
        fontWeight: toOverride?.fontWeight,
      };
  const a: TextStyleProps = overrider || {};
  const b: TextStyleProps = toOverride || {};
  return create({
    fontFamily: a.fontFamily || b.fontFamily,
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
    lineBreak: a.lineBreak ?? b.lineBreak,
    baseline: a.baseline ?? b.baseline,
    strike: a.strike ?? b.strike,
    opacity: a.opacity ?? b.opacity,
    characterSpacing: a.characterSpacing ?? b.characterSpacing,
    ...overriddenFontWeight,
  });
}

export function calculateFontSize(textStyle: TextStyle | undefined, defaultFontSize: number): number {
  const fontSize = textStyle && textStyle.fontSize ? textStyle.fontSize : defaultFontSize;
  const fontScale = textStyle && textStyle.fontScale ? textStyle.fontScale : 1.0;
  return fontSize * fontScale;
}
