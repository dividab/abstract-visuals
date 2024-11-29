import * as PageStyle from "../styles/page-style.js";
import * as SectionElement from "../section-elements/section-element.js";

export interface MasterPage {
  readonly style: PageStyle.PageStyle;
  readonly header: Array<SectionElement.SectionElement>;
  readonly footer: Array<SectionElement.SectionElement>;
}

export interface MasterPageProps {
  readonly style?: PageStyle.PageStyle;
  readonly header?: Array<SectionElement.SectionElement>;
  readonly footer?: Array<SectionElement.SectionElement>;
}

export function create(props?: MasterPageProps): MasterPage {
  const { style = PageStyle.create(), header = [], footer = [] } = props || {};
  return {
    style,
    header,
    footer,
  };
}
