export interface TextStyle {
  readonly type: "TextStyle";
  readonly fontFamily?: string;
  readonly bold?: boolean;
  readonly color?: string;
  readonly fontSize?: number;
  readonly italic?: boolean;
  readonly subScript?: boolean;
  readonly superScript?: boolean;
  readonly underline?: boolean;
  readonly verticalPosition?: number;
}

export interface TextStyleProps {
  readonly fontFamily?: string;
  readonly bold?: boolean;
  readonly color?: string;
  readonly fontSize?: number;
  readonly italic?: boolean;
  readonly subScript?: boolean;
  readonly superScript?: boolean;
  readonly underline?: boolean;
  readonly verticalPosition?: number;
}

export function create(props?: TextStyleProps): TextStyle {
  return {
    type: "TextStyle",
    ...(props || {})
  };
}

export function overrideWith(
  overrider: TextStyle | undefined,
  toOverride: TextStyle | undefined
): TextStyle {
  const a: TextStyleProps = overrider || {};
  const b: TextStyleProps = toOverride || {};
  return create({
    fontFamily: a.fontFamily || b.fontFamily,
    bold: a.bold || b.bold,
    color: a.color || b.color,
    fontSize: a.fontSize || b.fontSize,
    italic: a.italic || b.italic,
    subScript: a.subScript || b.subScript,
    superScript: a.superScript || b.superScript,
    underline: a.underline || b.underline,
    verticalPosition: a.verticalPosition || b.verticalPosition
  });
}
