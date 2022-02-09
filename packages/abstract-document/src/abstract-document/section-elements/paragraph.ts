import { Resources } from "../resources";
import { Atom } from "../atoms/atom";
import { ParagraphNumbering } from "./paragraph-numbering";
import * as ParagraphStyle from "../styles/paragraph-style";

export const sectionType = "Paragraph";

export type Paragraph = Resources & {
  readonly type: typeof sectionType;
  readonly styleName: string;
  readonly style: ParagraphStyle.ParagraphStyle;
  readonly numbering: ParagraphNumbering | undefined;
  readonly children: ReadonlyArray<Atom>;
};

export type ParagraphProps = Resources & {
  readonly styleName?: string;
  readonly style?: ParagraphStyle.ParagraphStyle;
  readonly numbering?: ParagraphNumbering;
};

export function create(props?: ParagraphProps, children?: ReadonlyArray<Atom>): Paragraph {
  const { styleName = "", style = ParagraphStyle.create(), numbering = undefined, ...rest } = props || {};
  return {
    type: sectionType,
    styleName,
    style,
    numbering,
    children: children || [],
    ...rest,
  };
}
