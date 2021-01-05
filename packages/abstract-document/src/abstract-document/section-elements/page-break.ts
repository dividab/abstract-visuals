import { Resources } from "../resources";

export type PageBreak = Resources & {
  readonly type: "PageBreak";
};

export type PageBreakProps = {};

export function create(props?: PageBreakProps): PageBreak {
  const {} = props || {};
  return {
    type: "PageBreak"
  };
}
