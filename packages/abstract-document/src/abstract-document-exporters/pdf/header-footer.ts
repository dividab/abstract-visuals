import * as AD from "../../abstract-document/index.js";

export function getHeaderAndFooter(
  section: AD.Section.Section,
  pageNo: number
): {
  readonly header: Array<AD.SectionElement.SectionElement>;
  readonly footer: Array<AD.SectionElement.SectionElement>;
  readonly headerMargins: Required<AD.LayoutFoundation.LayoutFoundation>;
  readonly footerMargins: Required<AD.LayoutFoundation.LayoutFoundation>;
} {
  const FIRST_PAGE = 1;
  const EVEN_PAGE = 0;
  const ODD_PAGE = 1;
  switch (true) {
    //first page
    case pageNo === FIRST_PAGE: {
      const normalHeader = section.page.frontHeader === undefined || section.page.frontHeader.length === 0;
      const normalFooter = section.page.frontFooter === undefined || section.page.frontFooter.length === 0;
      return {
        footer: normalFooter ? section.page.footer : section.page.frontFooter,
        header: normalHeader ? section.page.header : section.page.frontHeader,
        headerMargins: AD.LayoutFoundation.orDefault(
          normalHeader ? section.page.style.headerMargins : (section.page.style.firstPageHeaderMargins ?? section.page.style.headerMargins)
        ),
        footerMargins: AD.LayoutFoundation.orDefault(
          normalFooter ? section.page.style.footerMargins : (section.page.style.firstPageFooterMargins ?? section.page.style.footerMargins)
        ),
      };
    }
    case pageNo === 0:
    case pageNo % 2 === EVEN_PAGE:
    case pageNo % 2 === ODD_PAGE:
    default: {
      return {
        header: section.page.header,
        footer: section.page.footer,
        headerMargins: AD.LayoutFoundation.orDefault(section.page.style.headerMargins),
        footerMargins: AD.LayoutFoundation.orDefault(section.page.style.footerMargins),
      };
    }
  }
}
