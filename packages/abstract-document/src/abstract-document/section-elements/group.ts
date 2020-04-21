import { Resources } from "../resources";
import { SectionElement } from "./section-element";

export type Group = Resources & {
  readonly type: "Group";
  readonly keepTogether: boolean;
  readonly children: ReadonlyArray<SectionElement>;
};

export type GroupProps = Resources & {
  readonly keepTogether?: boolean;
};

export function create(
  props?: GroupProps,
  children?: ReadonlyArray<SectionElement>
): Group {
  const { keepTogether = false, ...rest } = props || {};
  return {
    type: "Group",
    keepTogether: keepTogether,
    children: children || [],
    ...rest
  };
}
