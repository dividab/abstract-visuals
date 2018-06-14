import * as AD from "../../abstract-document/index";

export type AstChildElements =
  | AstHeader
  | AstStr
  | AstParagraph
  | AstEmphasis
  | AstStrong;
export type AstElements = AstDocument | AstChildElements;

export interface AstMetaLoc {
  readonly start: { readonly line: number; readonly column: number };
  readonly end: { readonly line: number; readonly column: number };
}

export interface AstParagraph {
  readonly type: "Paragraph";
  readonly children: Array<AstChildElements>;
  readonly loc: AstMetaLoc;
  readonly range: Array<number>;
  readonly raw: string;
}

export interface AstEmphasis {
  readonly type: "Emphasis";
  readonly value: string;
  readonly children: Array<AstChildElements>;
  readonly loc: AstMetaLoc;
  readonly range: Array<number>;
  readonly raw: string;
}

export interface AstStrong {
  readonly type: "Strong";
  readonly value: string;
  readonly children: Array<AstChildElements>;
  readonly loc: AstMetaLoc;
  readonly range: Array<number>;
  readonly raw: string;
}

export interface AstStr {
  readonly type: "Str";
  readonly value: string;
  readonly loc: AstMetaLoc;
  readonly range: Array<number>;
  readonly raw: string;
}

export interface AstHeader {
  readonly type: "Header";
  readonly depth: number;
  readonly children: Array<AstChildElements>;
  readonly loc: AstMetaLoc;
  readonly range: Array<number>;
  readonly raw: string;
}

export interface AstDocument {
  readonly type: "Document";
  readonly children: Array<AstChildElements>;
  readonly loc: AstMetaLoc;
  readonly range: Array<number>;
  readonly raw: string;
}

export interface MarkDownProcessData {
  readonly atoms: Array<AD.Atom.Atom>;
  readonly paragraphs: Array<AD.Paragraph.Paragraph>;
}
