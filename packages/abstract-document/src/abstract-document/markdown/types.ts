import * as AD from "../../abstract-document/index";

export type AstChildElements =
  | AstHeading
  | AstText
  | AstParagraph
  | AstEmphasis
  | AstStrong
  | AstSubscript
  | AstSuperscript;
export type AstElements = AstRoot | AstChildElements;

export interface AstMetaLoc {
  readonly start: { readonly line: number; readonly column: number };
  readonly end: { readonly line: number; readonly column: number };
}

export interface AstParagraph {
  readonly type: "paragraph";
  readonly children: Array<AstChildElements>;
}

export interface AstEmphasis {
  readonly type: "emphasis";
  readonly children: Array<AstChildElements>;
}

export interface AstStrong {
  readonly type: "strong";
  readonly children: Array<AstChildElements>;
}

export interface AstSubscript {
  readonly type: "sub";
  readonly children: Array<AstChildElements>;
}

export interface AstSuperscript {
  readonly type: "sup";
  readonly children: Array<AstChildElements>;
}

export interface AstText {
  readonly type: "text";
  readonly value: string;
}

export interface AstHeading {
  readonly type: "heading";
  readonly depth: number;
  readonly children: Array<AstChildElements>;
}

export interface AstRoot {
  readonly type: "root";
  readonly children: Array<AstChildElements>;
}

export interface MarkDownProcessData {
  readonly atoms: Array<AD.Atom.Atom>;
  readonly paragraphs: Array<AD.Paragraph.Paragraph>;
}
