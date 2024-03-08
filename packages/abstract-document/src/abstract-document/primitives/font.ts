export interface Font {
  readonly light?: FontSource;
  readonly normal: FontSource;
  readonly medium?: FontSource;
  readonly bold: FontSource;
  readonly extraBold?: FontSource;
  readonly lightItalic?: FontSource;
  readonly italic: FontSource;
  readonly mediumItalic?: FontSource;
  readonly boldItalic: FontSource;
  readonly extraBoldItalic?: FontSource;
}

export type FontSource = string | Uint8Array;

export interface FontProps {
  readonly light?: FontSource;
  readonly normal: FontSource;
  readonly medium?: FontSource;
  readonly bold: FontSource;
  readonly extraBold?: FontSource;
  readonly lightItalic?: FontSource;
  readonly italic: FontSource;
  readonly mediumItalic?: FontSource;
  readonly boldItalic: FontSource;
  readonly extraBoldItalic?: FontSource;
}

export function create({
  light,
  normal,
  medium,
  bold,
  extraBold,
  lightItalic,
  italic,
  mediumItalic,
  boldItalic,
  extraBoldItalic,
}: FontProps): Font {
  return {
    light,
    normal,
    medium,
    bold,
    extraBold,
    lightItalic,
    italic,
    mediumItalic,
    boldItalic,
    extraBoldItalic,
  };
}
