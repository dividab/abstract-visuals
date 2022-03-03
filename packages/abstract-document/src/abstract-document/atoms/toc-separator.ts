// TODO: This should be part of some kind of table of content API that better maps to Word file generation.
//       TocSeparator would correspond to docx <w:fldChar w:fldCharType="separate"/> element.

export interface TocSeparator {
  readonly type: "TocSeparator";
  readonly width?: number;
}

export interface TocSeparatorProps {
  readonly width?: number;
}

export function create(_props: TocSeparatorProps): TocSeparator {
  return {
    type: "TocSeparator",
    width: _props.width,
  };
}
