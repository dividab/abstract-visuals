import React from "react";
import { ExportTestDef } from "../export-test-def";
import * as AD from "../../../../index";
import { Paragraph, AbstractDoc, Section, TextRun, TextField, render } from "../../../../abstract-document-jsx";

const header = [
  render(
    <Paragraph>
      <TextRun text="I am a header" />
      <TextField fieldType="PageNumber" />
      <TextRun text="/" />
      <TextField fieldType="TotalPages" />
    </Paragraph>
  ),
];

const footer = [
  render(
    <Paragraph>
      <TextRun text="I am a footer" />
    </Paragraph>
  ),
];

const page = AD.AbstractDoc.MasterPage.create({ header: header, footer: footer });

export const test: ExportTestDef = {
  name: "Header and footer",
  abstractDocJsx: (
    <AbstractDoc>
      <Section page={page}>
        <Paragraph>
          <TextRun text={"I am body"} />
        </Paragraph>
      </Section>
    </AbstractDoc>
  ),
  expectedDocxZipContexts: {
    "word/document.xml": `<w:document
  xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 w15 wp14"
>
  <w:background w:color="FFFFFF" />
  <w:body>
    <w:p>
      <w:pPr>
        <w:spacing w:before="0" w:after="0" w:line="1" />
      </w:pPr>
      <w:bookmarkStart w:name="" w:id="*" />
      <w:bookmarkEnd w:id="*" />
    </w:p>
    <w:p>
      <w:pPr>
        <w:spacing w:before="0" w:after="0" />
        <w:jc w:val="start" />
        <w:ind w:left="0" w:end="0" />
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:color w:val="black" />
          <w:sz w:val="20" />
          <w:szCs w:val="20" />
          <w:rFonts
            w:ascii="Arial"
            w:cs="Arial"
            w:eastAsia="Arial"
            w:hAnsi="Arial"
          />
        </w:rPr>
        <w:t xml:space="preserve">I am body</w:t>
      </w:r>
    </w:p>
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838" w:orient="portrait" />
      <w:pgMar
        w:top="0"
        w:right="0"
        w:bottom="0"
        w:left="0"
        w:header="0"
        w:footer="0"
        w:gutter="0"
        w:mirrorMargins="false"
      />
      <w:cols w:space="708" w:num="1" w:sep="false" />
      <w:docGrid w:linePitch="360" />
      <w:headerReference w:type="default" r:id="rId5" />
      <w:footerReference w:type="default" r:id="rId6" />
      <w:pgNumType />
    </w:sectPr>
  </w:body>
</w:document>
`,
  },
};
