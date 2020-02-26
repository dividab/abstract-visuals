import * as TextStyle from "../styles/text-style";

export type FieldType = "Date" | "PageNumber" | "TotalPages";

export interface TextField {
  readonly type: "TextField";
  readonly styleName: string;
  readonly fieldType: FieldType;
  readonly style: TextStyle.TextStyle;
}

export interface TextFieldProps {
  readonly styleName?: string;
  readonly fieldType: FieldType;
  readonly style?: TextStyle.TextStyle;
}

export function create(props: TextFieldProps): TextField {
  const { styleName = "", fieldType, style = TextStyle.create() } = props;
  return {
    type: "TextField",
    styleName,
    fieldType,
    style
  };
}
