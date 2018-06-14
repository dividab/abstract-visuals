import { Resources } from "../resources";
import { SectionElement } from "./section-element";

export type Group = Resources & {
  readonly type: "Group";
  readonly keepTogether: boolean;
  readonly children: SectionElement[];
};

export type GroupProps = Resources & {
  readonly keepTogether?: boolean;
  readonly children?: SectionElement[];
};

export function create(props?: GroupProps): Group {
  const { keepTogether = false, children = [], ...rest } = props || {};
  return {
    type: "Group",
    keepTogether: keepTogether,
    children: children,
    ...rest
  };
}
