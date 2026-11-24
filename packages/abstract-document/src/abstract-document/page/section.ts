import type { Resources } from "../resources.js";
import type { SectionElement } from "../section-elements/section-element.js";
import * as MasterPage from "./master-page.js";

export type Section = Resources & {
  readonly page: MasterPage.MasterPage;
  readonly id: string;
  readonly children: ReadonlyArray<SectionElement>;
  readonly restartPageNumbering: boolean;
};

export type SectionProps = Resources & {
  readonly page?: MasterPage.MasterPage;
  readonly id?: string;
  readonly restartPageNumbering?: boolean;
};

export function create(props?: SectionProps, children?: ReadonlyArray<SectionElement>): Section {
  const { page = MasterPage.create(), id = "", restartPageNumbering = false, ...rest } = props ?? {};
  return {
    page,
    id,
    restartPageNumbering,
    children: children ?? [],
    ...rest,
  };
}
