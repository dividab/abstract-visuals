import type { NumberingLevelDefinition } from "./numbering-level-definition.js";

export interface NumberingDefinition {
  readonly levels: Array<NumberingLevelDefinition>;
}

export interface NumberingDefinitionProps {
  readonly levels: Array<NumberingLevelDefinition>;
}

export function create({ levels }: NumberingDefinitionProps): NumberingDefinition {
  return {
    levels,
  };
}
