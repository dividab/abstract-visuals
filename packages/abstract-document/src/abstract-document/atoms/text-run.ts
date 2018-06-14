import * as TextStyle from "../styles/text-style";

export interface TextRun {
  readonly type: "TextRun";
  readonly styleName: string;
  readonly text: string;
  readonly style?: TextStyle.TextStyle;
}

export interface TextRunProps {
  readonly styleName?: string;
  readonly text: string;
  readonly style?: TextStyle.TextStyle;
}

export function create(props: TextRunProps): TextRun {
  const { styleName = "", text, style = TextStyle.create() } = props;
  return {
    type: "TextRun",
    styleName,
    text,
    style
  };
}
