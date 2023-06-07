export interface LineBreak {
  readonly type: "LineBreak";
}

export interface LineBreakProps {}

export function create(props?: LineBreakProps): LineBreak {
  return {
    type: "LineBreak",
  };
}
