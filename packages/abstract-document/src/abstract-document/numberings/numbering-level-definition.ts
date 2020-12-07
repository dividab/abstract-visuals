import * as TextStyle from "../styles/text-style";
import { NumberingFormat } from "./numbering-format";

export interface NumberingLevelDefinition {
  readonly level: number;
  readonly format: NumberingFormat;
  readonly start: number;
  readonly levelText: string;
  readonly levelIndention: number;
  readonly numberingWidth: number;
  readonly style: TextStyle.TextStyle;
}

export interface NumberingLevelDefinitionProps {
  readonly level: number;
  readonly format: NumberingFormat;
  readonly start: number;
  readonly levelText: string;
  readonly levelIndention: number;
  readonly numberingWidth?: number;
  readonly style?: TextStyle.TextStyle;
}

export function create({
  level,
  format,
  start,
  levelText,
  levelIndention,
  numberingWidth,
  style
}: NumberingLevelDefinitionProps): NumberingLevelDefinition {
  return {
    level,
    format,
    start,
    levelText,
    levelIndention,
    numberingWidth: numberingWidth || 40,
    style: style || TextStyle.create()
  };
}
