export interface ParagraphNumbering {
  readonly level: number;
  readonly numberingId: string;
  readonly numberOverride?: number;
  readonly append?: boolean;
}
