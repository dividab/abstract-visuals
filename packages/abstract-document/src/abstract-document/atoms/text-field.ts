import * as TextStyle from "../styles/text-style";

export type FieldType = "Date" | "PageNumber" | "TotalPages" | "PageNumberOf";

export interface TextField {
  readonly type: "TextField";
  readonly styleName: string;
  readonly fieldType: FieldType;
  readonly style: TextStyle.TextStyle;
  readonly target: string;
  readonly text: string;
}

export interface TextFieldProps {
  readonly styleName?: string;
  readonly fieldType: FieldType;
  readonly style?: TextStyle.TextStyle;
  readonly target?: string;
  readonly text?: string;
}

export function create(props: TextFieldProps): TextField {
  const {
    styleName = "",
    fieldType,
    style = TextStyle.create(),
    target = "",
    text = ""
  } = props;
  return {
    type: "TextField",
    styleName,
    fieldType,
    style,
    target,
    text
  };
}
