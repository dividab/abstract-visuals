export interface DashStyle {
  readonly dashes: ReadonlyArray<number>;
  readonly offset: number;
}

export function createDashStyle(dashes: ReadonlyArray<number>, offset: number = 0): DashStyle {
  return {
    dashes: dashes,
    offset: offset,
  };
}

export const solidLine = createDashStyle([]);
