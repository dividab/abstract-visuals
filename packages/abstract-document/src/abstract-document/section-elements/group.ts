import { Resources } from "../resources";
import { SectionElement } from "./section-element";
import * as GroupStyle from "../styles/group-style";

export const sectionType = "Group";

export type Group = Resources & {
  readonly type: typeof sectionType;
  readonly keepTogether: boolean;
  readonly style: GroupStyle.GroupStyle;
  readonly children: ReadonlyArray<SectionElement>;
};

export type GroupProps = Resources & {
  readonly keepTogether?: boolean;
  readonly style?: GroupStyle.GroupStyle;
};

export function create(props?: GroupProps, children?: ReadonlyArray<SectionElement>): Group {
  const { keepTogether = false, style = GroupStyle.create(), ...rest } = props || {};
  return {
    type: sectionType,
    keepTogether: keepTogether,
    style,
    children: children || [],
    ...rest,
  };
}
