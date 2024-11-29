import { NumberingLevelDefinition } from "./numbering-level-definition.js";

export interface NumberingDefinition {
  readonly levels: NumberingLevelDefinition[];
}

export interface NumberingDefinitionProps {
  readonly levels: NumberingLevelDefinition[];
}

export function create({ levels }: NumberingDefinitionProps): NumberingDefinition {
  return {
    levels,
  };
}
