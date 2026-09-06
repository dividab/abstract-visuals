import type { Resources } from "../resources.js";

export type PageBreak = Resources & {
  readonly type: "PageBreak";
};

export type PageBreakProps = object;

export function create(_props?: PageBreakProps): PageBreak {
  return {
    type: "PageBreak",
  };
}
