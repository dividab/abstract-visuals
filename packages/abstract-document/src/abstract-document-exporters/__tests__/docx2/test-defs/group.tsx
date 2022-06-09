import React from "react";
import { ExportTestDef } from "../export-test-def";
import {
  Paragraph,
  AbstractDoc,
  Section,
  TextRun,
  Group,
  Table,
  TableCell,
  TableRow,
} from "../../../../abstract-document-jsx";

export const test: ExportTestDef = {
  name: "Group",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Group>
          <Paragraph>
            <TextRun text={"Hello"} />
          </Paragraph>
          <Table columnWidths={[150, 100, 50]}>
            <TableRow>
              <TableCell>
                <Paragraph>
                  <TextRun text="Hello 1" />
                </Paragraph>
              </TableCell>
              <TableCell>
                <Paragraph>
                  <TextRun text="Hello 2" />
                </Paragraph>
              </TableCell>
              <TableCell>
                <Paragraph>
                  <TextRun text="Hello 3" />
                </Paragraph>
              </TableCell>
            </TableRow>
          </Table>
        </Group>
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
        <w:keepNext/>
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
        <w:t xml:space="preserve">Hello</w:t>
      </w:r>
    </w:p>
    <w:tbl>
      <w:tblPr>
        <w:tblCellMar>
          <w:bottom w:type="dxa" w:w="0"/>
          <w:top w:type="dxa" w:w="0"/>
          <w:left w:type="dxa" w:w="0"/>
          <w:right w:type="dxa" w:w="0"/>
        </w:tblCellMar>
        <w:tblBorders>
          <w:top w:val="none" w:sz="0" w:space="0" w:color=""/>
          <w:left w:val="none" w:sz="0" w:space="0" w:color=""/>
          <w:bottom w:val="none" w:sz="0" w:space="0" w:color=""/>
          <w:right w:val="none" w:sz="0" w:space="0" w:color=""/>
          <w:insideH w:val="none" w:sz="0" w:space="0" w:color=""/>
          <w:insideV w:val="none" w:sz="0" w:space="0" w:color=""/>
        </w:tblBorders>
          <w:tblW w:type="dxa" w:w="6000"/>
          <w:jc w:val="left"/>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="100"/>
        <w:gridCol w:w="100"/>
        <w:gridCol w:w="100"/>
      </w:tblGrid>
      <w:tr>
        <w:trPr>
          <w:cantSplit w:val="true"/>
        </w:trPr>
        <w:tc>
          <w:tcPr>
            <w:tcBorders>
              <w:top w:val="none" w:sz="0" w:color=""/>
              <w:bottom w:val="none" w:sz="0" w:color=""/>
              <w:left w:val="none" w:sz="0" w:color=""/>
              <w:right w:val="none" w:sz="0" w:color=""/>
            </w:tcBorders>
            <w:vAlign w:val="center"/>
            <w:tcMar>
              <w:top w:w="0" w:type="dxa"/>
              <w:bottom w:w="0" w:type="dxa"/>
              <w:end w:w="0" w:type="dxa"/>
              <w:start w:w="0" w:type="dxa"/>
            </w:tcMar>
            <w:shd/>
            <w:gridSpan w:val="1"/>
            <w:tcW w:w="3000" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr>
              <w:spacing w:before="0" w:after="0"/>
              <w:jc w:val="start"/>
              <w:ind w:left="0" w:end="0"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:color w:val="black"/>
                <w:sz w:val="20"/>
                <w:szCs w:val="20"/>
                <w:rFonts w:ascii="Arial" w:cs="Arial" w:eastAsia="Arial" w:hAnsi="Arial"/>
              </w:rPr>
              <w:t xml:space="preserve">Hello 1</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcBorders>
              <w:top w:val="none" w:sz="0" w:color=""/>
              <w:bottom w:val="none" w:sz="0" w:color=""/>
              <w:left w:val="none" w:sz="0" w:color=""/>
              <w:right w:val="none" w:sz="0" w:color=""/>
            </w:tcBorders>
            <w:vAlign w:val="center"/>
            <w:tcMar>
              <w:top w:w="0" w:type="dxa"/>
              <w:bottom w:w="0" w:type="dxa"/>
              <w:end w:w="0" w:type="dxa"/>
              <w:start w:w="0" w:type="dxa"/>
            </w:tcMar>
            <w:shd/>
            <w:gridSpan w:val="1"/>
            <w:tcW w:w="2000" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr>
              <w:spacing w:before="0" w:after="0"/>
              <w:jc w:val="start"/>
              <w:ind w:left="0" w:end="0"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:color w:val="black"/>
                <w:sz w:val="20"/>
                <w:szCs w:val="20"/>
                <w:rFonts w:ascii="Arial" w:cs="Arial" w:eastAsia="Arial" w:hAnsi="Arial"/>
              </w:rPr>
              <w:t xml:space="preserve">Hello 2</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcBorders>
              <w:top w:val="none" w:sz="0" w:color=""/>
              <w:bottom w:val="none" w:sz="0" w:color=""/>
              <w:left w:val="none" w:sz="0" w:color=""/>
              <w:right w:val="none" w:sz="0" w:color=""/>
            </w:tcBorders>
            <w:vAlign w:val="center"/>
            <w:tcMar>
              <w:top w:w="0" w:type="dxa"/>
              <w:bottom w:w="0" w:type="dxa"/>
              <w:end w:w="0" w:type="dxa"/>
              <w:start w:w="0" w:type="dxa"/>
            </w:tcMar>
            <w:shd/>
            <w:gridSpan w:val="1"/>
            <w:tcW w:w="1000" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:pPr>
              <w:spacing w:before="0" w:after="0"/>
              <w:jc w:val="start"/>
              <w:ind w:left="0" w:end="0"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:color w:val="black"/>
                <w:sz w:val="20"/>
                <w:szCs w:val="20"/>
                <w:rFonts w:ascii="Arial" w:cs="Arial" w:eastAsia="Arial" w:hAnsi="Arial"/>
              </w:rPr>
              <w:t xml:space="preserve">Hello 3</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
    <w:p>       
      <w:r>
        <w:rPr>
          <w:sz w:val="0.000001"/>
          <w:szCs w:val="0.000001"/>
        </w:rPr>
        <w:t xml:space="preserve">.</w:t>
      </w:r>
    </w:p>
    
    <w:sectPr>
      <w:pgSz w:w="11900" w:h="16840" w:orient="portrait" />
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
