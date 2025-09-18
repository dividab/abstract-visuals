import * as Elements from "./elements.js";
import * as Styles from "./styles.js";
import * as CustomElements from "./custom-elements.js";
import { parseXsd } from "handlebars-xml";

const commonParts = `${Styles.layoutFoundation}
${Elements.section}
${Elements.sectionElement}
${Elements.headerFooter}
${Elements.page}
${Elements.pageBreak}
${Elements.image}
${Elements.textField}
${Elements.textRun}
${Elements.hyperLink}
${Elements.tocSeparator}
${Elements.linkTarget}
${Styles.position}
${Styles.masterPageStyle}
${Elements.group}
${Styles.groupStyle}
${Styles.textStyle}
${Styles.paragraphStyle}
${Styles.tableStyle}
${Elements.paragraph}
${Elements.markdown}
${Styles.tableCellStyle}
${Elements.tableRow}
${Elements.headerRows}
${Elements.table}
${Elements.tableCell}
${CustomElements.textRow}
${CustomElements.textCell}
${CustomElements.textParagraph}
${CustomElements.imageRow}
${CustomElements.imageCell}
${CustomElements.imageParagraph}`;

export const xsd = `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    ${commonParts}
    ${Styles.StyleNames}
    ${Styles.StyleName}
    ${Elements.abstractDoc}
</xs:schema>`;

export const xsdPartial = `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    ${Elements.section}
    ${commonParts}
    <xs:element name="Table" type="Table" />
    <xs:element name="Group" type="Group" />
    <xs:element name="PageBreak" type="PageBreak" />
    <xs:element name="Paragraph" type="Paragraph" />
    <xs:element name="Markdown" type="Markdown" />
</xs:schema>`;

export const parsedXsd = parseXsd(xsd);

export const parsedXsdPartial = parseXsd(xsdPartial);
