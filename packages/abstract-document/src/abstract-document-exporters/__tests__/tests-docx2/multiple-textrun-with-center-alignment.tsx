import type { ExportTestDef } from "./_export-test-def.js";
import * as AD from "../../../index.js";
import { Paragraph, AbstractDoc, Section, TextRun } from "../../../abstract-document-jsx/index.js";

export const testMultipleTextrunWithCenterAlignment: ExportTestDef = {
  name: "Multiple textrun with Center alignment",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
          <TextRun text="This is a text" />
          <TextRun text="This is another text" style={AD.AbstractDoc.TextStyle.create({ color: "ff0000" })} />
          <TextRun text="This is a third text" />
        </Paragraph>
      </Section>
    </AbstractDoc>
  ),
  expectedDocxZipContexts: {
    "word/document.xml": `<w:document mc:Ignorable="w14 w15 wp14"
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
	xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex"
	xmlns:cx1="http://schemas.microsoft.com/office/drawing/2015/9/8/chartex"
	xmlns:cx2="http://schemas.microsoft.com/office/drawing/2015/10/21/chartex"
	xmlns:cx3="http://schemas.microsoft.com/office/drawing/2016/5/9/chartex"
	xmlns:cx4="http://schemas.microsoft.com/office/drawing/2016/5/10/chartex"
	xmlns:cx5="http://schemas.microsoft.com/office/drawing/2016/5/11/chartex"
	xmlns:cx6="http://schemas.microsoft.com/office/drawing/2016/5/12/chartex"
	xmlns:cx7="http://schemas.microsoft.com/office/drawing/2016/5/13/chartex"
	xmlns:cx8="http://schemas.microsoft.com/office/drawing/2016/5/14/chartex"
	xmlns:aink="http://schemas.microsoft.com/office/drawing/2016/ink"
	xmlns:am3d="http://schemas.microsoft.com/office/drawing/2017/model3d"
	xmlns:w16cex="http://schemas.microsoft.com/office/word/2018/wordml/cex"
	xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid"
	xmlns:w16="http://schemas.microsoft.com/office/word/2018/wordml"
	xmlns:w16sdtdh="http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash"
	xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex">
	<w:body>
		<w:p>
			<w:pPr>
				<w:spacing w:after="0" w:before="0" w:line="1"/>
			</w:pPr>
			<w:bookmarkStart w:name="" w:id="*"/>
			<w:bookmarkEnd w:id="*"/>
		</w:p>
		<w:p>
			<w:pPr>
				<w:keepNext w:val="false"/>
				<w:spacing w:after="0" w:before="0"/>
				<w:ind w:left="0" w:right="0"/>
				<w:jc w:val="center"/>
			</w:pPr>
			<w:r>
				<w:rPr>
					<w:rFonts w:ascii="Helvetica" w:cs="Helvetica" w:eastAsia="Helvetica" w:hAnsi="Helvetica"/>
					<w:b w:val="false"/>
					<w:bCs w:val="false"/>
					<w:color w:val="000000"/>
					<w:sz w:val="20"/>
					<w:szCs w:val="20"/>
				</w:rPr>
				<w:t xml:space="preserve">This is a text</w:t>
			</w:r>
			<w:r>
				<w:rPr>
					<w:rFonts w:ascii="Helvetica" w:cs="Helvetica" w:eastAsia="Helvetica" w:hAnsi="Helvetica"/>
					<w:b w:val="false"/>
					<w:bCs w:val="false"/>
					<w:color w:val="ff0000"/>
					<w:sz w:val="20"/>
					<w:szCs w:val="20"/>
				</w:rPr>
				<w:t xml:space="preserve">This is another text</w:t>
			</w:r>
			<w:r>
				<w:rPr>
					<w:rFonts w:ascii="Helvetica" w:cs="Helvetica" w:eastAsia="Helvetica" w:hAnsi="Helvetica"/>
					<w:b w:val="false"/>
					<w:bCs w:val="false"/>
					<w:color w:val="000000"/>
					<w:sz w:val="20"/>
					<w:szCs w:val="20"/>
				</w:rPr>
				<w:t xml:space="preserve">This is a third text</w:t>
			</w:r>
		</w:p>
		<w:sectPr>
			<w:headerReference w:type="default" r:id="*"/>
			<w:footerReference w:type="default" r:id="*"/>
			<w:pgSz w:w="11900" w:h="16840" w:orient="portrait"/>
			<w:pgMar w:top="0" w:right="0" w:bottom="0" w:left="0" w:header="0" w:footer="0" w:gutter="0"/>
			<w:pgNumType/>
			<w:titlePg w:val="false"/>
			<w:docGrid w:linePitch="360"/>
		</w:sectPr>
	</w:body>
</w:document>`,
  },
};
