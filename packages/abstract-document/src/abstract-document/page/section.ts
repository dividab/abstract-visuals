import { Resources } from "../resources.js";
import * as MasterPage from "./master-page.js";
import { SectionElement } from "../section-elements/section-element.js";

export type Section = Resources & {
  readonly page: MasterPage.MasterPage;
  readonly id: string;
  readonly children: ReadonlyArray<SectionElement>;
};

export type SectionProps = Resources & {
  readonly page?: MasterPage.MasterPage;
  readonly id?: string;
};

export function create(props?: SectionProps, children?: ReadonlyArray<SectionElement>): Section {
  const { page = MasterPage.create(), id = "", ...rest } = props || {};
  return {
    page,
    id,
    children: children || [],
    ...rest,
  };
}
