import { TextStyle } from "../index.js";

export interface LineBreak {
  readonly type: "LineBreak";
  readonly styleName: string;
  readonly nestedStyleNames?: ReadonlyArray<string>;
  readonly style?: TextStyle.TextStyle;
}

export interface LineBreakProps {
  readonly styleName?: string;
  readonly style?: TextStyle.TextStyle;
}

export function create(props?: LineBreakProps): LineBreak {
  const { styleName = "", style = TextStyle.create() } = props ?? {};
  return {
    type: "LineBreak",
    styleName,
    style,
  };
}
