// tslint:disable:variable-name
export const word_Header_rId1_xml = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" />`;

export const word_document_xml_original = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<!--This file represents a print-->
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:wordWrap w:val="on" />
        <w:spacing w:before="0" w:after="0" />
        <w:keepLines />
        <w:jc w:val="left" />
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial" />
          <w:sz w:val="20" />
          <w:szCs w:val="20" />
          <w:color w:val="000000" />
          <w:noProof w:val="true" />
          <w:lang w:eastAsia="en-US" />
        </w:rPr>
        <w:t xml:space="preserve">HELLO WORLD!</w:t>
      </w:r>
    </w:p>
    <w:sectPr>
      <w:footnotePr>
        <w:pos w:val="beneathText" />
      </w:footnotePr>
      <w:headerReference w:type="default" p4:id="rId1" xmlns:p4="http://schemas.openxmlformats.org/officeDocument/2006/relationships" />
      <w:pgSz w:w="11900" w:h="16840" />
      <w:pgMar w:top="453" w:bottom="453" w:left="1133" w:right="850" w:footer="100" />
    </w:sectPr>
  </w:body>
</w:document>`;

export const word_document_xml = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<!--This file represents a print-->
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:wordWrap w:val="on" />
        <w:spacing w:before="0" w:after="0" />
        <w:keepLines />
        <w:jc w:val="left" />
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial" />
          <w:sz w:val="21" />
          <w:szCs w:val="21" />
          <w:color w:val="000000" />
          <w:noProof w:val="true" />
          <w:lang w:eastAsia="en-US" />
        </w:rPr>
        <w:t xml:space="preserve">HELLO WORLD!</w:t>
      </w:r>
    </w:p>
    <w:sectPr>
      <w:footnotePr>
        <w:pos w:val="beneathText" />
      </w:footnotePr>
      <w:headerReference w:type="default" p1:id="rId1" xmlns:p1="http://schemas.openxmlformats.org/officeDocument/2006/relationships" />
      <w:pgSz w:w="11900" w:h="16840" />
      <w:pgMar w:top="453" w:bottom="453" w:left="1133" w:right="850" w:footer="100" />
    </w:sectPr>
  </w:body>
</w:document>`;

export const word_rels_document_xml_rels = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="/word/Header_rId1.xml" Id="rId1" />
</Relationships>`;

export const Content_Types_xml = `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Override PartName="/word/Header_rId1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml" />
  <Default Extension="xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml" />
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
</Types>`;
