export interface Font {
  readonly normal: FontSource;
  readonly bold: FontSource;
  readonly italic: FontSource;
  readonly boldItalic: FontSource;
}

export type FontSource = string | Uint8Array;

export interface FontProps {
  readonly normal: FontSource;
  readonly bold: FontSource;
  readonly italic: FontSource;
  readonly boldItalic: FontSource;
}

export function create({ normal, bold, italic, boldItalic }: FontProps): Font {
  return {
    normal,
    bold,
    italic,
    boldItalic
  };
}
