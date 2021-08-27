import React from "react";
import * as S from "stream";
import { exportToStream } from "../../../abstract-document-exporters/docx2/render";
import { Paragraph, AbstractDoc, Section, render } from "../../../abstract-document-jsx";
import jszip from "jszip";

describe("docx rendering", () => {
  it("simple render", async () => {
    console.log("Hej");
    // Arrage
    const abstractDoc = render(
      <AbstractDoc>
        <Section>
          <Paragraph></Paragraph>
        </Section>
      </AbstractDoc>
    );

    // Act
    // Get the DOCX (which by defintiion is a zipfile following open packaging convention)
    const docxStream = new S.PassThrough();
    exportToStream(docxStream, abstractDoc);
    const docxBuffer = await streamToBuffer(docxStream);
    // const docxString = streamToString(docxStream);
    const docxZip = await jszip.loadAsync(docxBuffer);

    const docxWordDocumentXml = await docxZip.file("word/document.xml")?.async("string");

    console.log(docxWordDocumentXml);

    // Assert
    // Check contents of DOCX zipfile
    // expect(docxWordDocumentXml).toEqual(`
    // <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    // <w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex" xmlns:cx1="http://schemas.microsoft.com/office/drawing/2015/9/8/chartex" xmlns:cx2="http://schemas.microsoft.com/office/drawing/2015/10/21/chartex" xmlns:cx3="http://schemas.microsoft.com/office/drawing/2016/5/9/chartex" xmlns:cx4="http://schemas.microsoft.com/office/drawing/2016/5/10/chartex" xmlns:cx5="http://schemas.microsoft.com/office/drawing/2016/5/11/chartex" xmlns:cx6="http://schemas.microsoft.com/office/drawing/2016/5/12/chartex" xmlns:cx7="http://schemas.microsoft.com/office/drawing/2016/5/13/chartex" xmlns:cx8="http://schemas.microsoft.com/office/drawing/2016/5/14/chartex" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:aink="http://schemas.microsoft.com/office/drawing/2016/ink" xmlns:am3d="http://schemas.microsoft.com/office/drawing/2017/model3d" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:w16cex="http://schemas.microsoft.com/office/word/2018/wordml/cex" xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid" xmlns:w16="http://schemas.microsoft.com/office/word/2018/wordml" xmlns:w16sdtdh="http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash" xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh wp14">
    //     <w:body>
    //         <w:p w14:paraId="20F36A51" w14:textId="77777777" w:rsidR="008C1A5F" w:rsidRPr="0016380F" w:rsidRDefault="0016380F">
    //             <w:pPr>
    //                 <w:rPr>
    //                     <w:lang w:val="en-US" />
    //                 </w:rPr>
    //             </w:pPr>
    //             <w:r>
    //                 <w:rPr>
    //                     <w:lang w:val="en-US" />
    //                 </w:rPr>
    //                 <w:t>hej</w:t>
    //             </w:r>
    //         </w:p>
    //         <w:sectPr w:rsidR="008C1A5F" w:rsidRPr="0016380F">
    //             <w:pgSz w:w="11906" w:h="16838" />
    //             <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0" />
    //             <w:cols w:space="708" />
    //             <w:docGrid w:linePitch="360" />
    //         </w:sectPr>
    //     </w:body>
    // </w:document>

    // `);
  });
});

async function streamToBuffer(stream: S.Stream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
