export type AbstractSheet = {
  readonly sheets: ReadonlyArray<Sheet>;
  readonly styles?: Styles;
};

export type Sheet = {
  readonly name: string;
  readonly cells: ReadonlyArray<Cells>;
  readonly colInfo?: ColInfos;
  readonly rowInfo?: RowInfos;
  readonly direction?: "row" | "col";
};

export type ColInfos = ReadonlyArray<ColInfo>;

export type ColInfo = { readonly hidden?: boolean; readonly widthPixels?: number };

export type RowInfos = ReadonlyArray<RowInfo>;

export type RowInfo = { readonly hidden?: boolean; readonly heightPixels?: number };

export type Cells = ReadonlyArray<Cell>;

export type Cell = (NumberCell | TextCell | BoolCell | DateCell) & { readonly styles?: ReadonlyArray<string> };

export type NumberCell = { readonly type: "number"; readonly value: string | number | boolean | Date };
export type TextCell = { readonly type: "string"; readonly value: string | number | boolean | Date };
export type BoolCell = { readonly type: "boolean"; readonly value: string | number | boolean | Date };
export type DateCell = { readonly type: "date"; readonly value: string | number | boolean | Date };

export type CellType = Cell["type"];

export type Styles = ReadonlyArray<Style>;

export type Style = {
  readonly name: string;
  readonly vertical?: "top" | "center" | "bottom";
  readonly horizontal?: "left" | "center" | "right";
  readonly wrapText?: boolean;
  readonly textRotation?: number;
  readonly borderStyle?: {
    readonly top?: BorderStyle;
    readonly right?: BorderStyle;
    readonly bottom?: BorderStyle;
    readonly left?: BorderStyle;
  };
  readonly borderColor?: {
    readonly top?: string;
    readonly right?: string;
    readonly bottom?: string;
    readonly left?: string;
  };
  readonly fillType?: "solid" | "none";
  readonly foreground?: string;
  readonly background?: string;
  readonly bold?: boolean;
  readonly color?: string;
  readonly italic?: boolean;
  readonly font?: string;
  readonly strike?: boolean;
  readonly size?: number;
  readonly underline?: boolean;
  readonly script?: "superscript" | "subscript";
  readonly numberFormat?: string;
};

const borderStyles = [
  "dashDotDot",
  "dashDot",
  "dashed",
  "dotted",
  "hair",
  "mediumDashDotDot",
  "mediumDashDot",
  "mediumDashed",
  "medium",
  "slantDashDot",
  "thick",
  "thin",
] as const;

export type BorderStyle = (typeof borderStyles)[number];
export const borderStyleRecord = Object.fromEntries(borderStyles.map((s) => [s, s]));

//dummy
