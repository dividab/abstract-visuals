import * as TextStyle from "../styles/text-style.js";

export interface HyperLink {
  readonly type: "HyperLink";
  readonly styleName: string;
  readonly text: string;
  readonly target: string;
  readonly style: TextStyle.TextStyle;
}

export interface HyperLinkProps {
  readonly styleName?: string;
  readonly text: string;
  readonly target: string;
  readonly style?: TextStyle.TextStyle;
}

export function create(props: HyperLinkProps): HyperLink {
  const { styleName = "", text, target, style = TextStyle.create() } = props;
  return {
    type: "HyperLink",
    styleName,
    text,
    target,
    style,
  };
}
