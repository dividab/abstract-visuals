import * as TextStyle from "../styles/text-style";

export interface WhiteSpace {
  readonly type: "WhiteSpace";
}

export interface WhiteSpaceProps {}

export function create(_props: WhiteSpaceProps): WhiteSpace {
  return {
    type: "WhiteSpace"
  };
}
