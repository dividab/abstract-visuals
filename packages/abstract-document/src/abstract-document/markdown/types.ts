import type * as AD from "../../abstract-document/index.js";

export type AstChildElements =
  | AstHeading
  | AstText
  | AstParagraph
  | AstEmphasis
  | AstStrong
  | AstSubscript
  | AstSuperscript
  | AstList
  | AstListItem
  | AstBreak
  | AstLeaf;
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

export interface AstList {
  readonly type: "list";
  readonly ordered?: boolean;
  readonly start?: number;
  readonly spread?: boolean;
  readonly children: Array<AstChildElements>; // technically only AstListItem appears hear
}

export interface AstListItem {
  readonly type: "listItem";
  readonly spread?: boolean;
  readonly children: Array<AstChildElements>;
}

export interface AstBreak {
  readonly type: "break";
}

/** A node remark-parse creates without children, which the export leaves out, e.g. html, inline code or a thematic break */
export interface AstLeaf {
  readonly type: "inlineCode" | "code" | "html" | "thematicBreak" | "image" | "imageReference" | "footnoteReference" | "definition";
}

export interface MarkDownProcessData {
  readonly atoms: Array<AD.Atom.Atom>;
  readonly paragraphs: Array<AD.Paragraph.Paragraph>;
}
