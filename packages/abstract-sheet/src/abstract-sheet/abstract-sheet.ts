export type AbstractSheet = {
  readonly sheets: Sheets;
  readonly styles?: Styles;
};

export type Sheets = ReadonlyArray<Sheet>;

export type Sheet = {
  readonly name: string;
  readonly rows: Rows;
  readonly colInfo?: ColInfos;
  readonly rowInfo?: RowInfos;
};

export type ColInfos = ReadonlyArray<ColInfo>;

export type ColInfo = { readonly hidden?: boolean; readonly widthPixels?: number };

export type RowInfos = ReadonlyArray<RowInfo>;

export type RowInfo = { readonly hidden?: boolean; readonly heightPixels?: number };

export type Rows = ReadonlyArray<Row>;

export type Row = ReadonlyArray<Cell>;

export type Cell = {
  readonly value: string | number;
  readonly styles?: ReadonlyArray<string>;
  readonly type: CellType;
};

export type CellType = "string" | "number";

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
