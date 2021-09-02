import React from "react";
import { ExportTestDef } from "../export-test-def";
import { Paragraph, AbstractDoc, Section, HyperLink, TextRun } from "../../../../abstract-document-jsx";

export const test: ExportTestDef = {
  name: "Mixed hyperlink and textrun",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <HyperLink text={"Hello"} target="https://divid.se" />
          <TextRun text={"Hello there"} />
          <HyperLink text={"Hello again"} target="https://divid.se" />
          <TextRun text={"Hello there again"} />
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
      <w:hyperlink w:history="1" r:id="*">
        <w:r>
          <w:rPr>
            <w:color w:val="blue" />
            <w:sz w:val="20" />
            <w:szCs w:val="20" />
            <w:rFonts
              w:ascii="Arial"
              w:cs="Arial"
              w:eastAsia="Arial"
              w:hAnsi="Arial"
            />
          </w:rPr>
          <w:t xml:space="preserve">Hello</w:t>
        </w:r>
      </w:hyperlink>
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
        <w:t xml:space="preserve">Hello there</w:t>
      </w:r>
      <w:hyperlink w:history="1" r:id="*">
        <w:r>
          <w:rPr>
            <w:color w:val="blue" />
            <w:sz w:val="20" />
            <w:szCs w:val="20" />
            <w:rFonts
              w:ascii="Arial"
              w:cs="Arial"
              w:eastAsia="Arial"
              w:hAnsi="Arial"
            />
          </w:rPr>
          <w:t xml:space="preserve">Hello again</w:t>
        </w:r>
      </w:hyperlink>
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
        <w:t xml:space="preserve">Hello there again</w:t>
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
      <w:headerReference w:type="default" r:id="*" />
      <w:footerReference w:type="default" r:id="*" />
      <w:pgNumType />
    </w:sectPr>
  </w:body>
</w:document>
`,
  },
};
