import { Resources } from "../resources";
import { Atom } from "../atoms/atom";
import { ParagraphNumbering } from "./paragraph-numbering";
import * as ParagraphStyle from "../styles/paragraph-style";

export type PageBreak = Resources & {
  readonly type: "PageBreak";
};

export type PageBreakProps = {};

export function create(props?: PageBreakProps): PageBreak {
  const {} = props || {};
  return {
    type: "PageBreak"
  };
}
