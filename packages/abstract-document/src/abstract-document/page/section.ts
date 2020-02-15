import { Resources } from "../resources";
import * as MasterPage from "./master-page";
import { SectionElement } from "../section-elements/section-element";

export type Section = Resources & {
  readonly page: MasterPage.MasterPage;
  readonly id: string;
  readonly children: SectionElement[];
};

export type SectionProps = Resources & {
  readonly page?: MasterPage.MasterPage;
  readonly id?: string;
  readonly children?: SectionElement[];
};

export function create(props?: SectionProps): Section {
  const { page = MasterPage.create(), id = "", children = [], ...rest } = props || {};
  return {
    page,
    id,
    children,
    ...rest
  };
}
