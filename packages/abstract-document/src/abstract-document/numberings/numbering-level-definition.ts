import { NumberingFormat } from "./numbering-format";

export interface NumberingLevelDefinition {
  readonly level: number;
  readonly format: NumberingFormat;
  readonly start: number;
  readonly levelText: string;
  readonly levelIndention: number;
}

export interface NumberingLevelDefinitionProps {
  readonly level: number;
  readonly format: NumberingFormat;
  readonly start: number;
  readonly levelText: string;
  readonly levelIndention: number;
}

export function create({
  level,
  format,
  start,
  levelText,
  levelIndention
}: NumberingLevelDefinitionProps): NumberingLevelDefinition {
  return {
    level,
    format,
    start,
    levelText,
    levelIndention
  };
}
