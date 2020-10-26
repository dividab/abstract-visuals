export interface Font {
  readonly normal: FontSource;
  readonly medium?: FontSource;
  readonly bold: FontSource;
  readonly italic: FontSource;
  readonly mediumItalic?: FontSource;
  readonly boldItalic: FontSource;
}

export type FontSource = string | Uint8Array;

export interface FontProps {
  readonly normal: FontSource;
  readonly medium?: FontSource;
  readonly bold: FontSource;
  readonly italic: FontSource;
  readonly mediumItalic?: FontSource;
  readonly boldItalic: FontSource;
}

export function create({
  normal,
  medium,
  bold,
  italic,
  mediumItalic,
  boldItalic
}: FontProps): Font {
  return {
    normal,
    medium,
    bold,
    italic,
    mediumItalic,
    boldItalic
  };
}
