//tslint:disable

// import {
//   AbstractDoc,
//   Table, Paragraph, TextField, TextRun, TableCell,
//   PageStyle, SectionElement, Image, MasterPage, TextProperties,
//   Atom, TableCellProperties, TextAlignment, NumberingFormat, LayoutFoundation
// } from "../../abstract-document/index";
// import * as Color from "../../abstract-image/color";
// import {DocumentContainer} from "./document-container";
// import * as DocxConstants from "./docx-constants";
//
// import {AbstractImage} from "../../abstract-image/abstract-image";
// import {XmlWriter} from "./xml-writer";
// import {stringToUtf8ByteArray} from "./string-utils";
// import * as JSZip from "jszip";
//
// export type ImageFormat = "PNG" | "SVG";
//
// export interface ExportedImage {
//   output: Uint8Array;
//   format: ImageFormat;
// }
//
// export interface ExportAbstractImageFunc {
//   (format: ImageFormat, image: AbstractImage, scale: number): ExportedImage;
// }
//
// export type ZipArchiveItem = ZipArchiveItemXmlString | ZipArchiveItemAbstractImage;
//
// export interface ZipArchiveItemXmlString {
//   type: "XmlString";
//   xml: string;
// }
//
// export interface ZipArchiveItemAbstractImage {
//   type: "AbstractImage";
//   image: AbstractImage;
//   renderFormat: string;
//   renderScale: number;
// }
//
// export interface  ZipMap {
//   [key: string]: ZipArchiveItem;
// }
//
// interface GetNewReferenceId {
//   (): string;
// }
//
// interface State {
//   imageContentTypesAdded: Array<string>;
//   readonly imageHash: Map<string, any>;
//   readonly numberingDefinitionIdTranslation: Map<string, number>;
//   readonly numberingIdTranslation: Map<string, number>;
//   referenceId: number;
// }
//
// export function exportToDocx(exportAbstractImageFunc: ExportAbstractImageFunc,
//                              doc: AbstractDoc.AbstractDoc): Promise<Uint8Array> {
//
//   // Create map that corresponds to zip file
//   const zipFiles = exportToZipMap(doc);
//
//   // Convert all archive items to byte arrays
//   const convertedZipFiles = new Map<string, Uint8Array>();
//
//   for (const itemKey of Object.keys(zipFiles)) {
//     const item = zipFiles[itemKey];
//     if (item) {
//       switch (item.type) {
//         case "AbstractImage":
//           const renderedImage = exportAbstractImageFunc("PNG", item.image, item.renderScale);
//           convertedZipFiles.set(itemKey, renderedImage.output);
//           break;
//         case "XmlString":
//           convertedZipFiles.set(itemKey, stringToUtf8ByteArray(item.xml));
//           break;
//       }
//     }
//   }
//
//   // Write the zip
//   const zip = new JSZip();
//   for (const itemKey of Array.from(convertedZipFiles.keys())) {
//     const data = convertedZipFiles.get(itemKey);
//     zip.file(itemKey, data);
//   }
//   return zip.generateAsync({type: "uint8array"});
//
// }
//
// export function exportToZipMap(abstractDoc: AbstractDoc.AbstractDoc): ZipMap {
//
//   // this._state.imageContentTypesAdded = [];
//   // this._state.imageHash.clear();
//
//   const state: State = {
//     imageContentTypesAdded: [],
//     imageHash: new Map<string, any>(),
//     numberingDefinitionIdTranslation: new Map<string, number>(),
//     numberingIdTranslation: new Map<string, number>(),
//     referenceId: 0,
//   };
//
//   const GetNewReferenceId = (state: State): string => {
//     state.referenceId += 1;
//     return "rId" + state.referenceId;
//   };
//
//
//   const zipFiles: ZipMap = {};
//
//   const contentTypesDoc = new DocumentContainer();
//   contentTypesDoc.filePath = DocxConstants.ContentTypesPath;
//   contentTypesDoc.fileName = "[Content_Types].xml";
//   contentTypesDoc.XMLWriter.WriteStartDocument();
//   contentTypesDoc.XMLWriter.WriteStartElement("Types", DocxConstants.ContentTypeNamespace);
//
//   const mainDoc = new DocumentContainer();
//   mainDoc.filePath = DocxConstants.DocumentPath;
//   mainDoc.fileName = "document.xml";
//   mainDoc.contentType = DocxConstants.MainContentType;
//   mainDoc.XMLWriter.WriteStartDocument(true);
//   mainDoc.XMLWriter.WriteComment("This file represents a print");
//   mainDoc.XMLWriter.WriteStartElement("document", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   mainDoc.XMLWriter.WriteStartElement("body", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//
//   if (Object.keys(abstractDoc.numberings).length > 0) {
//     const numberingDoc = new DocumentContainer();
//     numberingDoc.filePath = DocxConstants.NumberingPath;
//     numberingDoc.fileName = "numbering.xml";
//     numberingDoc.contentType = DocxConstants.NumberingContentType;
//     numberingDoc.XMLWriter.WriteStartDocument();
//     numberingDoc.XMLWriter.WriteStartElement("numbering", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//
//     // <w:abstractNum>
//     let wordNumberingDefinitionId: number = 1;
//     for (const key of Object.keys(abstractDoc.numberingDefinitions)) {
//       const numDef = abstractDoc.numberingDefinitions[key];
//       numberingDoc.XMLWriter.WriteStartElement("abstractNum", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       numberingDoc.XMLWriter.WriteAttributeString("abstractNumId", wordNumberingDefinitionId.toString(), DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//
//       // <w:lvl>
//       for (const numDefLevel of numDef.levels) {
//         //<w:lvl w:ilvl="0" w:tplc="041D0019">
//         //  <w:start w:val="1"/>
//         //  <w:numFmt w:val="lowerLetter"/>
//         //  <w:lvlText w:val="%1."/>
//         //  <w:lvlJc w:val="left"/>
//         //  <w:pPr>
//         //    <w:ind w:left="1440" w:hanging="360"/>
//         //  </w:pPr>
//         //</w:lvl>
//         numberingDoc.XMLWriter.WriteStartElement("lvl", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//         numberingDoc.XMLWriter.WriteAttributeString("ilvl", numDefLevel.level.toString(), DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//         numberingDoc.XMLWriter.WriteStartElement("start", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//         numberingDoc.XMLWriter.WriteAttributeString("val", numDefLevel.start.toString(), DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//         numberingDoc.XMLWriter.WriteEndElement();
//         const numFmt = convertNumFormat(numDefLevel.format);
//         numberingDoc.XMLWriter.WriteStartElement("numFmt", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//         numberingDoc.XMLWriter.WriteAttributeString("val", numFmt, DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//         numberingDoc.XMLWriter.WriteEndElement();
//         numberingDoc.XMLWriter.WriteStartElement("lvlText", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//         numberingDoc.XMLWriter.WriteAttributeString("val", numDefLevel.levelText, DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//         numberingDoc.XMLWriter.WriteEndElement();
//
//         numberingDoc.XMLWriter.WriteStartElement("lvlJc", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//         numberingDoc.XMLWriter.WriteAttributeString("val", "left", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//         numberingDoc.XMLWriter.WriteEndElement();
//
//         numberingDoc.XMLWriter.WriteStartElement("pPr", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//         numberingDoc.XMLWriter.WriteStartElement("ind", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//         numberingDoc.XMLWriter.WriteAttributeString("left", numDefLevel.levelIndention.twips.toString(), DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//         numberingDoc.XMLWriter.WriteAttributeString("hanging", "800", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//         numberingDoc.XMLWriter.WriteEndElement();
//         numberingDoc.XMLWriter.WriteEndElement();
//
//         //<w:rPr>
//         //var effectiveStyle = numDefLevel.GetEffectiveTextStyle(abstractDoc.Styles);
//         const textProperties = numDefLevel.textProperties;
//         if (textProperties != null) {
//           numberingDoc.XMLWriter.WriteStartElement("rPr", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//           //  <w:b/>
//           if (textProperties.bold)
//             numberingDoc.XMLWriter.WriteStartElement("b", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//           numberingDoc.XMLWriter.WriteEndElement();
//           numberingDoc.XMLWriter.WriteEndElement();
//           // TODO: Support more of the TextStyle...
//         }
//
//         numberingDoc.XMLWriter.WriteEndElement();
//       }
//       state.numberingDefinitionIdTranslation.set(key, wordNumberingDefinitionId++);
//     }
//
//     numberingDoc.XMLWriter.WriteEndElement(); // abstractNum
//
//     let wordNumberingId: number = 1;
//     for (const key of Object.keys(abstractDoc.numberings)) {
//       const value = abstractDoc.numberings[key];
//       numberingDoc.XMLWriter.WriteStartElement("num", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       numberingDoc.XMLWriter.WriteAttributeString("numId", wordNumberingId.toString(), DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       numberingDoc.XMLWriter.WriteStartElement("abstractNumId", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       const wordDefinitionId = state.numberingDefinitionIdTranslation.get(value.definitionId) as number;
//       numberingDoc.XMLWriter.WriteAttributeString("val", wordDefinitionId.toString(), DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       numberingDoc.XMLWriter.WriteEndElement();
//       numberingDoc.XMLWriter.WriteEndElement();
//       state.numberingIdTranslation.set(key, wordNumberingId++);
//     }
//     numberingDoc.XMLWriter.WriteEndElement();
//     const refid = GetNewReferenceId(state);
//     mainDoc.references.AddReference(refid, numberingDoc.filePath + numberingDoc.fileName,
//       DocxConstants.NumberingNamespace);
//     //mainDoc.references.AddReference2("rId1",  numberingDoc.FileName, DocxConstants.NumberingNamespace);
//
//     addDocumentToArchive(zipFiles, numberingDoc, contentTypesDoc, true);
//   }
//
//
//   //<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
//   //<w:numbering xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 w15 wp14">
//   //  <w:abstractNum w:abstractNumId="0">
//   //    <w:nsid w:val="00283020"/>
//   //    <w:multiLevelType w:val="hybridMultilevel"/>
//   //    <w:tmpl w:val="D6702D88"/>
//   //    <w:lvl w:ilvl="0" w:tplc="041D0019">
//   //      <w:start w:val="1"/>
//   //      <w:numFmt w:val="lowerLetter"/>
//   //      <w:lvlText w:val="%1."/>
//   //      <w:lvlJc w:val="left"/>
//   //      <w:pPr>
//   //        <w:ind w:left="1440" w:hanging="360"/>
//   //      </w:pPr>
//   //    </w:lvl>
//   //    <w:lvl w:ilvl="1" w:tplc="041D0019">
//   //      <w:start w:val="1"/>
//   //      <w:numFmt w:val="lowerLetter"/>
//   //      <w:lvlText w:val="%2."/>
//   //      <w:lvlJc w:val="left"/>
//   //      <w:pPr>
//   //        <w:ind w:left="2160" w:hanging="360"/>
//   //      </w:pPr>
//   //    </w:lvl>
//   //    <w:lvl w:ilvl="2" w:tplc="041D001B" w:tentative="1">
//   //      <w:start w:val="1"/>
//   //      <w:numFmt w:val="lowerRoman"/>
//   //      <w:lvlText w:val="%3."/>
//   //      <w:lvlJc w:val="right"/>
//   //      <w:pPr>
//   //        <w:ind w:left="2880" w:hanging="180"/>
//   //      </w:pPr>
//   //    </w:lvl>
//   //  </w:abstractNum>
//   //  <w:num w:numId="2">
//   //    <w:abstractNumId w:val="0"/>
//   //  </w:num>
//   //</w:numbering>
//
//   let lastMasterPage: MasterPage.MasterPage | null = null;
//   let currentHeader: DocumentContainer | null = null;
//   let lastHeader: DocumentContainer | null = null;
//   let pages = 0;
//   for (const section of abstractDoc.children) {
//     if (section.page.header != null && section.page.header.length > 0) {
//       lastHeader = currentHeader;
//
//       currentHeader = new DocumentContainer();
//       const headerXmlWriter = currentHeader.XMLWriter;
//       headerXmlWriter.WriteStartDocument(true);
//       headerXmlWriter.WriteStartElement("hdr", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       const header = section.page.header;
//       for (const paragraph of header) {
//         addBaseParagraphDocX(abstractDoc, headerXmlWriter, zipFiles, currentHeader, contentTypesDoc, paragraph,
//           false, state.imageHash, state.imageContentTypesAdded, () => GetNewReferenceId(state), state.numberingIdTranslation);
//       }
//
//       headerXmlWriter.WriteEndElement();
//
//       const refid = GetNewReferenceId(state);
//       currentHeader.refId = refid;
//       currentHeader.filePath = DocxConstants.DocumentPath;
//       currentHeader.fileName = "Header_" + refid + ".xml";
//       currentHeader.contentType = DocxConstants.HeaderContentType;
//       mainDoc.references.AddReference(refid, currentHeader.filePath + currentHeader.fileName,
//         DocxConstants.HeaderNamespace);
//
//       addDocumentToArchive(zipFiles, currentHeader, contentTypesDoc, true);
//     }
//     else {
//       lastHeader = currentHeader;
//
//       currentHeader = new DocumentContainer();
//       const headerXmlWriter = currentHeader.XMLWriter;
//       headerXmlWriter.WriteStartDocument(true);
//
//       headerXmlWriter.WriteStartElement("hdr", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       headerXmlWriter.WriteEndElement();
//
//       const refid = GetNewReferenceId(state);
//       currentHeader.refId = refid;
//       currentHeader.filePath = DocxConstants.DocumentPath;
//       currentHeader.fileName = "Header_" + refid + ".xml";
//       currentHeader.contentType = DocxConstants.HeaderContentType;
//       mainDoc.references.AddReference(refid, currentHeader.filePath + currentHeader.fileName,
//         DocxConstants.HeaderNamespace);
//
//       addDocumentToArchive(zipFiles, currentHeader, contentTypesDoc, true);
//     }
//
//     if (lastMasterPage != null) {
//       insertPageSettingsParagraph(mainDoc.XMLWriter, lastMasterPage, lastHeader as DocumentContainer);
//       pages++;
//     }
//
//     lastMasterPage = section.page;
//
//     for (const paragraph of section.children)
//       addBaseParagraphDocX(abstractDoc, mainDoc.XMLWriter, zipFiles, mainDoc, contentTypesDoc, paragraph, false,
//         state.imageHash, state.imageContentTypesAdded, () => GetNewReferenceId(state), state.numberingIdTranslation);
//   }
//
//   if (lastMasterPage != null) {
//     lastHeader = currentHeader;
//     insertPageSettings(mainDoc.XMLWriter, lastMasterPage, lastHeader as DocumentContainer);
//   }
//
//   if (mainDoc.XMLWriter != null) {
//     mainDoc.XMLWriter.WriteEndElement();
//     mainDoc.XMLWriter.WriteEndElement();
//     mainDoc.XMLWriter.Flush();
//     addDocumentToArchive(zipFiles, mainDoc, contentTypesDoc, false);
//     addSupportFilesContents(zipFiles, contentTypesDoc);
//   }
//
//   return zipFiles;
//   // // Write the zip
//   // const zipBytes = this._zipService.CreateZipFile(zipFiles);
//   // resultStream.Write(zipBytes, 0, zipBytes.length);
// }
//
// function addBaseParagraphDocX(doc: AbstractDoc.AbstractDoc,
//                               xmlWriter: XmlWriter,
//                               zip: ZipMap,
//                               currentDocument: DocumentContainer,
//                               contentTypesDoc: DocumentContainer,
//                               newSectionElement: SectionElement.SectionElement,
//                               inTable: boolean,
//                               imageHash: Map<string, any>, imageContentTypesAdded: Array<string>,
//                               getNewReferenceId: GetNewReferenceId,
//                               numberingIdTranslation: Map<string, number>): void {
//
//   if (!newSectionElement) {
//     insertEmptyParagraph(xmlWriter);
//     return;
//   }
//
//   switch (newSectionElement.type) {
//     case "Table":
//       insertTable(doc, xmlWriter, zip, currentDocument, contentTypesDoc, newSectionElement,
//         imageHash, imageContentTypesAdded, getNewReferenceId, numberingIdTranslation);
//       // Om man lägger in en tabell i en tabell så måste man lägga till en tom paragraf under...
//       if (inTable)
//         insertEmptyParagraph(xmlWriter);
//       return;
//     case "Paragraph":
//       insertParagraph(doc, xmlWriter, zip, currentDocument, contentTypesDoc, newSectionElement,
//         imageHash, imageContentTypesAdded, getNewReferenceId, numberingIdTranslation);
//       return;
//     case "KeepTogether":
//       for (const sectionElement of newSectionElement.children)
//         addBaseParagraphDocX(doc, xmlWriter, zip, currentDocument, contentTypesDoc, sectionElement, inTable,
//           imageHash, imageContentTypesAdded, getNewReferenceId, numberingIdTranslation);
//       return;
//   }
//
//   throw new Error("The type has not been implemented in printer");
// }
//
// function insertTable(doc: AbstractDoc.AbstractDoc, xmlWriter: XmlWriter, zip: ZipMap,
//                      currentDocument: DocumentContainer,
//                      contentTypesDoc: DocumentContainer, tPara: Table.Table,
//                      imageHash: Map<string, any>, imageContentTypesAdded: Array<string>,
//                      getNewReferenceId: GetNewReferenceId,
//                      numberingIdTranslation: Map<string, number>): void {
//
//   //var xml = doc.ToXml();
//
//   xmlWriter.WriteStartElement("tbl", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteStartElement("tblPr", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteStartElement("tblW", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("w", "0", DocxConstants.WordNamespace);
//   xmlWriter.WriteAttributeString("type", "auto", DocxConstants.WordNamespace);
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("tblLayout", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("type", "fixed", DocxConstants.WordNamespace);
//   xmlWriter.WriteEndElement();
//
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("tblGrid", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   for (const w of tPara.columnWidths) {
//     xmlWriter.WriteStartElement("gridCol", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//     xmlWriter.WriteAttributeString("w", ((w * DocxConstants.PointOoXmlFactor)).toString(), DocxConstants.WordNamespace);
//     xmlWriter.WriteEndElement();
//   }
//   xmlWriter.WriteEndElement();
//
//   for (let r = 0; r <= Table.nrOfRows(tPara) - 1; r++) {
//     xmlWriter.WriteStartElement("tr", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//     xmlWriter.WriteStartElement("trPr", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//
//     if (!isNaN(tPara.children[r].height)) {
//       xmlWriter.WriteStartElement("trHeight", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       xmlWriter.WriteAttributeString("val", ((tPara.children[r].height * DocxConstants.PointOoXmlFactor)).toString(), DocxConstants.WordNamespace);
//       xmlWriter.WriteAttributeString("type", "atLeast", DocxConstants.WordNamespace);
//       xmlWriter.WriteEndElement();
//     }
//     xmlWriter.WriteStartElement("cantSplit", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//     xmlWriter.WriteEndElement();
//     xmlWriter.WriteEndElement();
//
//     let c = 0;
//     let tc = 0;
//     while (c < tPara.columnWidths.length) {
//       //var ptc = tPara.GetCell(r, tc);
//       let ptc = getCell(/*doc,*/ tPara, r, tc) as TableCell.TableCell;
//       let effectiveCellProps = TableCell.getEffectiveTableCellProperties(/*doc.styles,*/ tPara, ptc);
//
//       // let effectiveTableProps = Table.getEffectiveTableProperties(doc.styles, tPara);
//
//       //if (effectiveTableProps.BorderThickness.GetValueOrDefault(0) > double.Epsilon)
//       //{
//       //if (effectiveCellProps.Borders.Bottom == null)
//       //  effectiveCellProps.Borders.Bottom = effectiveTableProps.BorderThickness;
//       //if (effectiveCellProps.Borders.Top == null)
//       //  effectiveCellProps.Borders.Top = effectiveTableProps.BorderThickness;
//       //if (effectiveCellProps.Borders.Left == null)
//       //  effectiveCellProps.Borders.Left = effectiveTableProps.BorderThickness;
//       //if (effectiveCellProps.Borders.Right == null)
//       //  effectiveCellProps.Borders.Right = effectiveTableProps.BorderThickness;
//       //}
//
//       xmlWriter.WriteStartElement("tc", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       xmlWriter.WriteStartElement("tcPr", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       if (effectiveCellProps.background && effectiveCellProps.background.a > 0) {
//         xmlWriter.WriteStartElement("shd", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//         xmlWriter.WriteAttributeString("val", "clear", DocxConstants.WordNamespace);
//         xmlWriter.WriteAttributeString("color", "auto", DocxConstants.WordNamespace);
//         xmlWriter.WriteAttributeString("fill", Color.toString6Hex(effectiveCellProps.background), DocxConstants.WordNamespace);
//         xmlWriter.WriteEndElement();
//       }
//
//       xmlWriter.WriteStartElement("gridSpan", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       xmlWriter.WriteAttributeString("val", ptc.columnSpan.toString(), DocxConstants.WordNamespace);
//       xmlWriter.WriteEndElement();
//       xmlWriter.WriteStartElement("tcBorders", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       if (effectiveCellProps) {
//         if (effectiveCellProps.borders.bottom || 0 > 0)
//           addBordersToCell(xmlWriter, effectiveCellProps.borders.bottom as number, "bottom");
//         if (effectiveCellProps.borders.left || 0 > 0)
//           addBordersToCell(xmlWriter, effectiveCellProps.borders.left as number, "left");
//         if (effectiveCellProps.borders.top || 0 > 0)
//           addBordersToCell(xmlWriter, effectiveCellProps.borders.top as number, "top");
//         if (effectiveCellProps.borders.right || 0 > 0)
//           addBordersToCell(xmlWriter, effectiveCellProps.borders.right as number, "right");
//       }
//       xmlWriter.WriteEndElement();
//
//       xmlWriter.WriteStartElement("tcMar", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       let mTop = 0;
//       let mBottom = 0;
//       let mLeft = 0;
//       let mRight = 0;
//
//       if (effectiveCellProps.padding.top)
//         mTop = effectiveCellProps.padding.top;
//       if (effectiveCellProps.padding.bottom)
//         mBottom = effectiveCellProps.padding.bottom;
//       if (effectiveCellProps.padding.left)
//         mLeft = effectiveCellProps.padding.left;
//       if (effectiveCellProps.padding.right)
//         mRight = effectiveCellProps.padding.right;
//
//       xmlWriter.WriteStartElement("top", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       xmlWriter.WriteAttributeString("w", mTop.toString(), DocxConstants.WordNamespace);
//       xmlWriter.WriteAttributeString("type", "dxa", DocxConstants.WordNamespace);
//       xmlWriter.WriteEndElement();
//       xmlWriter.WriteStartElement("bottom", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       xmlWriter.WriteAttributeString("w", mBottom.toString(), DocxConstants.WordNamespace);
//       xmlWriter.WriteAttributeString("type", "dxa", DocxConstants.WordNamespace);
//       xmlWriter.WriteEndElement();
//       xmlWriter.WriteStartElement("right", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       xmlWriter.WriteAttributeString("w", mRight.toString(), DocxConstants.WordNamespace);
//       xmlWriter.WriteAttributeString("type", "dxa", DocxConstants.WordNamespace);
//       xmlWriter.WriteEndElement();
//       xmlWriter.WriteStartElement("left", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       xmlWriter.WriteAttributeString("w", mLeft.toString(), DocxConstants.WordNamespace);
//       xmlWriter.WriteAttributeString("type", "dxa", DocxConstants.WordNamespace);
//       xmlWriter.WriteEndElement();
//       xmlWriter.WriteEndElement();
//       xmlWriter.WriteEndElement();
//
//       if (ptc.children.length == 0) {
//         insertEmptyParagraph(xmlWriter);
//       }
//       else {
//         for (const bp of ptc.children) {
//           // TODO: Detta kan ge lite konstiga resultat om man har en tabell först och sedan text...
//           // Borde kolla om det bara finns en och det är en tabell eller om det finns två men båra är tabeller osv.
//           addBaseParagraphDocX(doc, xmlWriter, zip, currentDocument, contentTypesDoc, bp, true,
//             imageHash, imageContentTypesAdded, getNewReferenceId, numberingIdTranslation);
//         }
//       }
//
//       xmlWriter.WriteEndElement();
//       c += ptc.columnSpan;
//       tc += 1;
//     }
//     xmlWriter.WriteEndElement();
//   }
//
//   xmlWriter.WriteEndElement();
// }
//
// function insertParagraph(doc: AbstractDoc.AbstractDoc, xmlWriter: XmlWriter, zip: ZipMap,
//                          currentDocument: DocumentContainer, contentTypesDoc: DocumentContainer, para: Paragraph.Paragraph,
//                          imageHash: Map<string, any>, imageContentTypesAdded: Array<string>,
//                          getNewReferenceId: GetNewReferenceId,
//                          numberingIdTranslation: Map<string, number>): void {
//
//   const effectiveParaProps = Paragraph.getEffectiveParagraphProperties(doc.styles, para);
//
//   xmlWriter.WriteStartElement("p", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteStartElement("pPr", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteStartElement("wordWrap", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("val", "on", DocxConstants.WordNamespace);
//   xmlWriter.WriteEndElement();
//
//   xmlWriter.WriteStartElement("spacing", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   if (effectiveParaProps.spacingBefore)
//     xmlWriter.WriteAttributeString("before", effectiveParaProps.spacingBefore.twips.toString(), DocxConstants.WordNamespace);
//   if (effectiveParaProps.spacingAfter)
//     xmlWriter.WriteAttributeString("after", effectiveParaProps.spacingAfter.twips.toString(), DocxConstants.WordNamespace);
//   xmlWriter.WriteEndElement();
//
//   if (para.numbering != null) {
//     xmlWriter.WriteStartElement("numPr", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//     xmlWriter.WriteStartElement("ilvl", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//     xmlWriter.WriteAttributeString("val", para.numbering.level.toString(), DocxConstants.WordNamespace);
//     xmlWriter.WriteEndElement();
//     xmlWriter.WriteStartElement("numId", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//     const wordNumberingId = getWordNumberingId(para.numbering.numberingId, numberingIdTranslation);
//     xmlWriter.WriteAttributeString("val", wordNumberingId.toString(), DocxConstants.WordNamespace);
//     xmlWriter.WriteEndElement();
//     xmlWriter.WriteEndElement();
//   }
//
//   xmlWriter.WriteElementString("keepLines", "", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
// //var effectiveStyle = para.GetEffectiveStyle(doc.Styles);
//   insertJc(xmlWriter, effectiveParaProps.alignment);
//   xmlWriter.WriteEndElement();
//
//   for (const comp of para.children) {
//     insertComponent(doc, xmlWriter, zip, currentDocument, contentTypesDoc, comp,
//       imageHash, imageContentTypesAdded, getNewReferenceId);
//   }
//   xmlWriter.WriteEndElement();
// }
//
// function getWordNumberingId(numberingId: string, numberingIdTranslation: Map<string, number>): number {
//   return numberingIdTranslation.get(numberingId) as number;
// }
//
//
// function insertComponent(doc: AbstractDoc.AbstractDoc, xmlWriter: XmlWriter, zip: ZipMap,
//                          currentDocument: DocumentContainer, contentTypesDoc: DocumentContainer, bc: Atom.Atom,
//                          imageHash: Map<string, any>, imageContentTypesAdded: Array<string>,
//                          getNewReferenceId: GetNewReferenceId): void {
//
//   switch (bc.type) {
//     case "TextField":
//       insertFieldComponent(doc, xmlWriter, bc);
//       break;
//     case "TextRun":
//       const effectiveTextProps = TextRun.getEffectiveTextProperties(doc.styles, bc);
//       insertTextComponent(/*doc,*/ xmlWriter, bc, effectiveTextProps);
//       break;
//     case "Image":
//       insertImageComponent(xmlWriter, zip, currentDocument, contentTypesDoc, bc, imageHash,
//         imageContentTypesAdded, getNewReferenceId);
//       break;
//     default:
//       throw new Error("Contents of job is not implemented in printer");
//   }
//
// }
//
//
// function insertImageComponent(xmlWriter: XmlWriter, zip: ZipMap,
//                               currentDocument: DocumentContainer, contentTypesDoc: DocumentContainer, image: Image.Image,
//                               imageHash: Map<string, any>, imageContentTypesAdded: Array<string>,
//                               getNewReferenceId: GetNewReferenceId): void {
//
//   const renderedImageFormat = "PNG";
//
// // Lägg till referens
//   if (!imageHash.has(image.imageResource.id.toString())) {
//     const refId = getNewReferenceId();
//     addImageReference2(zip, contentTypesDoc, image, renderedImageFormat, imageContentTypesAdded, imageHash, refId);
//   }
//
// //Lägg till bilden i dokumentet
//   const rid = imageHash.get(image.imageResource.id.toString()).toString();
//
// //Behöver komma åt dokumentet som bilden tillhör
//   const filePath = DocxConstants.ImagePath + "image_" + rid + "." + renderedImageFormat;
//   currentDocument.references.AddReference(rid, filePath, DocxConstants.ImageNamespace);
//
// //Lägg till i MainPart
// //Lägg till bilden i en run
//   xmlWriter.WriteStartElement("r", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   insertImage(xmlWriter, rid, image.width, image.height);
//   xmlWriter.WriteEndElement();
// //}
// }
//
// function convertNumFormat(format: NumberingFormat.NumberingFormat): string {
//   let wordNumFmt: string = "decimal";
//   switch (format) {
//     case "Decimal":
//       wordNumFmt = "decimal";
//       break;
//     case "DecimalZero":
//       wordNumFmt = "decimalZero";
//       break;
//     case "LowerLetter":
//       wordNumFmt = "lowerLetter";
//       break;
//     case "LowerRoman":
//       wordNumFmt = "lowerRoman";
//       break;
//     case "UpperLetter":
//       wordNumFmt = "upperLetter";
//       break;
//     case "UpperRoman":
//       wordNumFmt = "upperRoman";
//       break;
//   }
//   return wordNumFmt;
// }
//
//
// function addImageReference2(zip: ZipMap, contentTypesDoc: DocumentContainer,
//                             image: Image.Image, renderedImageFormat: string, imageContentTypesAdded: Array<string>,
//                             imageHash: Map<string, any>, refId: string): void {
//
//   const filePath = DocxConstants.ImagePath + "image_" + refId + "." + renderedImageFormat;
//
//   const mimeType = getMimeType(renderedImageFormat);
//   if (imageContentTypesAdded.indexOf(mimeType) === -1) {
//     insertImageContentType(renderedImageFormat, mimeType, contentTypesDoc);
//     imageContentTypesAdded.push(mimeType);
//   }
//
//   addImageToArchive(zip, filePath, image.imageResource.abstractImage, image.imageResource.renderScale, "PNG");
//
//   imageHash.set(image.imageResource.id.toString(), refId);
// }
//
// function addSupportFilesContents(zip: ZipMap, contentTypesDoc: DocumentContainer): void {
//   addHeadRef(zip);
//   addContentTypes(zip, contentTypesDoc);
// }
//
// function addContentTypes(zip: ZipMap, contentTypesDoc: DocumentContainer): void {
//   insertDefaultContentTypes(contentTypesDoc);
//   contentTypesDoc.XMLWriter.WriteEndElement(); //Avslutar types
//   addDocumentToArchive(zip, contentTypesDoc, contentTypesDoc, false);
// }
//
//
// function insertPageSettingsParagraph(xmlWriter: XmlWriter, ps: MasterPage.MasterPage, lastHeader: DocumentContainer): void {
//   xmlWriter.WriteStartElement("p", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteStartElement("pPr", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   insertPageSettings(xmlWriter, ps, lastHeader);
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteEndElement();
// }
//
// function insertPageSettings(xmlWriter: XmlWriter, ps: MasterPage.MasterPage, lastHeader: DocumentContainer): void {
//   xmlWriter.WriteStartElement("sectPr", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteStartElement("footnotePr", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteStartElement("pos", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("val", "beneathText", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteEndElement();
//   if (lastHeader != null) {
//     xmlWriter.WriteStartElement("headerReference", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//     xmlWriter.WriteAttributeString("type", "default", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//     xmlWriter.WriteAttributeString("id", lastHeader.refId, DocxConstants.RelNamespace);
//     xmlWriter.WriteEndElement();
//   }
//   xmlWriter.WriteStartElement("pgSz", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("w", (PageStyle.getWidth(ps.style) * DocxConstants.PointOoXmlFactor).toString(), DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("h", (PageStyle.getHeight(ps.style) * DocxConstants.PointOoXmlFactor).toString(), DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   if (ps.style.orientation == "Landscape")
//     xmlWriter.WriteAttributeString("orient", "landscape", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("pgMar", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("top", ((ps.style.margins.top * DocxConstants.PointOoXmlFactor)).toFixed(0), DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("bottom", ((ps.style.margins.bottom * DocxConstants.PointOoXmlFactor)).toFixed(0), DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("left", ((ps.style.margins.left * DocxConstants.PointOoXmlFactor)).toFixed(0), DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("right", ((ps.style.margins.right * DocxConstants.PointOoXmlFactor)).toFixed(0), DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("footer", "100", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteEndElement();
// }
//
// function insertDateComponent(doc: AbstractDoc.AbstractDoc, xmlWriter: XmlWriter, tf: TextField.TextField): void {
//   xmlWriter.WriteStartElement("r", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
// //var style = fc.GetEffectiveStyle(doc.Styles) ?? ps.TextProperties;
//   const textProperties = TextField.getEffectiveStyle(doc.styles, tf).textProperties;
//
//   insertRunProperty(xmlWriter, textProperties);
//   xmlWriter.WriteStartElement("fldChar", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("fldCharType", "begin", DocxConstants.WordNamespace);
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("r", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   insertRunProperty(xmlWriter, textProperties);
//   xmlWriter.WriteStartElement("instrText", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("space", "preserve", "", "xml");
//   xmlWriter.WriteString(" DATE \\@YYYY/MM/DD ");
// //var fcText = new TextRun("{ DATE \\@YYYY/MM/DD }", tf.GetEffectiveStyle(doc.Styles));
//   const fcText = TextRun.create({text: "{ DATE \\@YYYY/MM/DD }", textProperties: TextField.getEffectiveStyle(doc.styles, tf).textProperties});
//
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("r", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   insertRunProperty(xmlWriter, textProperties);
//   xmlWriter.WriteStartElement("fldChar", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("fldCharType", "separate", DocxConstants.WordNamespace);
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteEndElement();
//   const effectiveStyle = TextField.getEffectiveStyle(doc.styles, tf);
//   insertTextComponent(/*doc,*/ xmlWriter, fcText, effectiveStyle.textProperties);
//   xmlWriter.WriteStartElement("r", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   insertRunProperty(xmlWriter, textProperties);
//   xmlWriter.WriteStartElement("fldChar", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("fldCharType", "end", DocxConstants.WordNamespace);
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteEndElement();
// }
//
//
// function insertTextComponent(/*doc: AbstractDoc, */xmlWriter: XmlWriter, tr: TextRun.TextRun, textProperties: TextProperties.TextProperties): void {
//   //var effectiveStyle = tc.GetEffectiveStyle(doc.Styles);
//   insertText(xmlWriter, tr.text, textProperties);
// }
//
// function escape(text: string): string {
//   if (text === null || text === undefined) return "";
//
//   const escapeMap: {[key: string]: string} = {
//     ">": "&gt;",
//     "<": "&lt;",
//     "'": "&apos;",
//     "\"": "&quot;",
//     "&": "&amp;",
//   }
//
//   return text.replace(new RegExp("([&\"<>'])", "g"), (_str, item) => escapeMap[item])
// }
//
//
// function insertText(xmlWriter: XmlWriter, text: string, textProperties: TextProperties.TextProperties): void {
//   xmlWriter.WriteStartElement("r", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//
// //var style = componentStyle ?? ps.TextProperties;
// //var style = textProperties.TextProperties;
//   insertRunProperty(xmlWriter, textProperties);
//
//   xmlWriter.WriteStartElement("t", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("space", "preserve", "", "xml");
//   xmlWriter.WriteString(escape(text));
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteEndElement();
// }
//
// function insertEmptyParagraph(xmlWriter: XmlWriter): void {
//   xmlWriter.WriteStartElement("p", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteStartElement("pPr", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteStartElement("spacing", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("after", "0", DocxConstants.WordNamespace);
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteEndElement();
// }
//
//
// function getCell(/*abstractDoc: AbstractDoc,*/ table: Table.Table, r: number, c: number): TableCell.TableCell | null {
//
//   if (r >= Table.nrOfRows(table))
//     return null;
//
//   const row = table.children[r];
//   if (c < row.children.length)
//     return row.children[c];
//
//   // Denna rad innehåller inte alla kolumner...
//   // Kolla om något element i denna rad innehåller ett element
//   let cs: TableCellProperties.TableCellProperties | undefined;
//   for (const ptc of row.children) {
//     if (ptc == null)
//       break;
//     //if (ptc.GetEffectiveStyle() != null)
//     cs = TableCell.getEffectiveTableCellProperties(/*abstractDoc.styles,*/ table, ptc);
//   }
//   if (!cs) {
//     // cs = new TableCellPropertiesBuilder().build();
//     cs = TableCellProperties.create({
//       borders: LayoutFoundation.create({top: 0, bottom: 0, left: 0, right: 0}),
//       padding: LayoutFoundation.create({top: 0, bottom: 0, left: 0, right: 0})
//     });
//   }
//   return TableCell.create({tableCellProperties: cs as TableCellProperties.TableCellProperties, columnSpan: 1, children: []});
// }
//
// function insertFieldComponent(doc: AbstractDoc.AbstractDoc, xmlWriter: XmlWriter, fc: TextField.TextField): void {
//   switch (fc.fieldType) {
//     case "Date":
//       insertDateComponent(doc, xmlWriter, fc);
//       break;
//     case "PageNumber":
//       xmlWriter.WriteStartElement("r", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       //var style = fc.GetEffectiveStyle(doc.Styles) ?? ps.TextProperties;
//       const style = TextField.getEffectiveStyle(doc.styles, fc).textProperties;
//       insertRunProperty(xmlWriter, style);
//       xmlWriter.WriteElementString("pgNum", "", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//       xmlWriter.WriteEndElement();
//       break;
//     default:
//       throw new Error(`Field type '${fc.fieldType}' has not been implemented in printer`);
//   }
// }
//
// function addBordersToCell(xmlWriter: XmlWriter, borderdef: number, borderLocation: string): void {
//   xmlWriter.WriteStartElement(borderLocation, DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("val", "single", DocxConstants.WordNamespace);
//   xmlWriter.WriteAttributeString("sz", (borderdef * DocxConstants.PointOoXmlFactor).toString(), DocxConstants.WordNamespace);
//   xmlWriter.WriteAttributeString("space", "0", DocxConstants.WordNamespace);
//   xmlWriter.WriteAttributeString("color", "000000", DocxConstants.WordNamespace);
//   xmlWriter.WriteEndElement();
// }
//
// function insertJc(xmlWriter: XmlWriter, ta: TextAlignment.TextAlignment | undefined): void {
//   xmlWriter.WriteStartElement("jc", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   if (ta == "Center")
//     xmlWriter.WriteAttributeString("val", "center", DocxConstants.WordNamespace);
//   else if (ta == "Start")
//     xmlWriter.WriteAttributeString("val", "left", DocxConstants.WordNamespace);
//   else if (ta == "End")
//     xmlWriter.WriteAttributeString("val", "right", DocxConstants.WordNamespace);
//   else
//     xmlWriter.WriteAttributeString("val", "left", DocxConstants.WordNamespace);
//   xmlWriter.WriteEndElement(); //jc
// }
//
// function insertRunProperty(xmlWriter: XmlWriter, textProperties: TextProperties.TextProperties): void {
//   xmlWriter.WriteStartElement("rPr", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   if (textProperties.subScript || textProperties.superScript) {
//     xmlWriter.WriteStartElement("vertAlign", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//     xmlWriter.WriteAttributeString("val", textProperties.subScript ? "subscript" : "superscript", DocxConstants.WordNamespace);
//     xmlWriter.WriteEndElement();
//   }
//
//   xmlWriter.WriteStartElement("rFonts", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("ascii", "Arial", DocxConstants.WordNamespace);
//   xmlWriter.WriteAttributeString("hAnsi", "Arial", DocxConstants.WordNamespace);
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("sz", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("val", ((((textProperties.fontSize) + 0.5)) * 2).toString(), DocxConstants.WordNamespace);
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("szCs", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("val", ((((textProperties.fontSize) + 0.5)) * 2).toString(), DocxConstants.WordNamespace);
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("color", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("val", textProperties.color != null ? textProperties.color.replace("#", "").substring(0, 6) : "000000", DocxConstants.WordNamespace);
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("noProof", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("val", "true", DocxConstants.WordNamespace);
//   xmlWriter.WriteEndElement();
//   if (textProperties.bold) {
//     xmlWriter.WriteElementString("b", "", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//     xmlWriter.WriteElementString("bCs", "", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   }
//   if (textProperties.italic) {
//     xmlWriter.WriteElementString("i", "", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//     xmlWriter.WriteElementString("iCs", "", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   }
//   if (textProperties.underline) {
//     xmlWriter.WriteStartElement("u", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//     xmlWriter.WriteAttributeString("val", "single", DocxConstants.WordNamespace);
//     xmlWriter.WriteEndElement();
//   }
//
//   xmlWriter.WriteStartElement("lang", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteAttributeString("eastAsia", "en-US", DocxConstants.WordNamespace);
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteEndElement();
// }
//
//
// function insertImage(xmlWriter: XmlWriter, rid: string, width: number, height: number): void {
//   xmlWriter.WriteStartElement("pict", DocxConstants.WordNamespace, DocxConstants.WordPrefix);
//   xmlWriter.WriteStartElement("shapetype", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("coordsize", "21600,21600");
//   xmlWriter.WriteAttributeString("spt", "75", DocxConstants.OfficeNamespace, DocxConstants.OfficePrefix);
//   xmlWriter.WriteAttributeString("preferrelative", "t", DocxConstants.OfficeNamespace, DocxConstants.OfficePrefix);
//   xmlWriter.WriteAttributeString("path", "m@4@5l@4@11@9@11@9@5xe");
//   xmlWriter.WriteAttributeString("filled", "f");
//   xmlWriter.WriteAttributeString("stroked", "f");
//   xmlWriter.WriteStartElement("stroke", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("joinstyle", "miter");
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("formulas", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteStartElement("f", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("eqn", "if lineDrawn pixelLineWidth 0");
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("f", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("eqn", "sum @0 1 0");
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("f", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("eqn", "sum 0 0 @1");
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("f", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("eqn", "prod @2 1 2");
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("f", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("eqn", "prod @3 21600 pixelWidth");
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("f", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("eqn", "prod @3 21600 pixelHeight");
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("f", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("eqn", "sum @0 0 1");
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("f", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("eqn", "prod @6 1 2");
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("f", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("eqn", "prod @7 21600 pixelWidth");
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("f", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("eqn", "sum @8 21600 0");
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("f", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("eqn", "prod @7 21600 pixelHeight");
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("f", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("eqn", "sum @10 21600 0");
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("path", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("extrusionok", "f", DocxConstants.OfficeNamespace, DocxConstants.OfficePrefix);
//   xmlWriter.WriteAttributeString("gradientshapeok", "t");
//   xmlWriter.WriteAttributeString("connecttype", "rect", DocxConstants.OfficeNamespace, DocxConstants.OfficePrefix);
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteStartElement("lock", DocxConstants.OfficeNamespace, DocxConstants.OfficePrefix);
//   xmlWriter.WriteAttributeString("ext", "edit", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("aspectratio", "t");
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteEndElement();
//
//   xmlWriter.WriteStartElement("shape", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("style",
//     stringFormat(DocxConstants.ImageStyle, width.toFixed(2), height.toFixed(2))
//   );
//   xmlWriter.WriteStartElement("imagedata", DocxConstants.VmlNamespace, DocxConstants.VmlPrefix);
//   xmlWriter.WriteAttributeString("id", rid, DocxConstants.RelNamespace, DocxConstants.RelPrefix);
//   xmlWriter.WriteAttributeString("title", "", DocxConstants.OfficeNamespace, DocxConstants.OfficePrefix);
//   xmlWriter.WriteEndElement();
//
//   xmlWriter.WriteEndElement();
//   xmlWriter.WriteEndElement();
// }
//
// function stringFormat(s: string, ...rest: any[]): string {
//   let result = s;
//   for (let i = 0; i < rest.length; i++) {
//     result = result.replace("{" + i + "}", rest[i]);
//   }
//   return result;
// }
//
// function insertDocumentContentType(filename: string, contentType: string, contentTypesDoc: DocumentContainer): void {
//   contentTypesDoc.XMLWriter.WriteStartElement("Override");
//   filename = filename.replace("\\", "/");
//   if (filename.startsWith("/") == false)
//     filename = "/" + filename;
//   contentTypesDoc.XMLWriter.WriteAttributeString("PartName", filename);
//   contentTypesDoc.XMLWriter.WriteAttributeString("ContentType", contentType);
//   contentTypesDoc.XMLWriter.WriteEndElement(); //Override
// }
//
// function insertImageContentType(extension: string, mimeType: string, contentTypesDoc: DocumentContainer): void {
//   contentTypesDoc.XMLWriter.WriteStartElement("Default");
//   contentTypesDoc.XMLWriter.WriteAttributeString("Extension", extension);
//   contentTypesDoc.XMLWriter.WriteAttributeString("ContentType", mimeType);
//   contentTypesDoc.XMLWriter.WriteEndElement(); //Default
// }
//
// function insertDefaultContentTypes(contentTypesDoc: DocumentContainer): void {
//   contentTypesDoc.XMLWriter.WriteStartElement("Default");
//   contentTypesDoc.XMLWriter.WriteAttributeString("Extension", "xml");
//   contentTypesDoc.XMLWriter.WriteAttributeString("ContentType", DocxConstants.MainContentType);
//   contentTypesDoc.XMLWriter.WriteEndElement(); //Default
//   contentTypesDoc.XMLWriter.WriteStartElement("Default");
//   contentTypesDoc.XMLWriter.WriteAttributeString("Extension", "rels");
//   contentTypesDoc.XMLWriter.WriteAttributeString("ContentType", DocxConstants.RelationContentType);
//   contentTypesDoc.XMLWriter.WriteEndElement(); //Default
// }
//
// function getMimeType(format: string): string {
//   switch (format.toLowerCase()) {
//     case "gif":
//       return "image/gif";
//     case "jpeg":
//     case "jpg":
//       return "image/jpeg";
//     case "png":
//       return "image/png";
//     case "bmp":
//       return "image/bmp";
//     default:
//       throw new Error("Unknown ImageType");
//   }
// }
//
// function addHeadRef(zip: ZipMap): void {
//
//   // const headref = new MemoryStream();
//   // const contents = Encoding.UTF8.GetBytes(DocxConstants.HeadRelXml);
//   // headref.Write(contents, 0, contents.Length);
//   //
//   // AddToArchive(zip, DocxConstants.RefPath + ".rels", headref);
//   // //headref.Close();
//   // headref.Dispose();
//
//   const contents = DocxConstants.HeadRelXml;
//   addXmlStringToArchive(zip, DocxConstants.RefPath + ".rels", contents);
// }
//
// function addDocumentToArchive(zip: ZipMap, docToAdd: DocumentContainer,
//                               contentTypesDoc: DocumentContainer, insertContentType: boolean): void {
//
//   // Add document
//   const docToAddFullPath = docToAdd.filePath + docToAdd.fileName;
//   addXmlStringToArchive(zip, docToAddFullPath, docToAdd.XMLWriter.getXml());
//
//   // Add references document if it exists
//   if (docToAdd.references.count > 0) {
//     docToAdd.references.finish();
//     addXmlStringToArchive(zip, docToAdd.filePath + DocxConstants.RefPath + docToAdd.fileName + ".rels",
//       docToAdd.references.XMLWriter.getXml());
//     docToAdd.references.XMLWriter.close();
//   }
//   docToAdd.XMLWriter.close();
//
//   // What does this do? It mutates the contentTypesDoc...
//   if (insertContentType) {
//     insertDocumentContentType(docToAddFullPath, docToAdd.contentType, contentTypesDoc);
//   }
//
// }
//
// function addXmlStringToArchive(zip: ZipMap, filePath: string, xml: string): void {
//   //const ms = stringToUtf8ByteArray(xml);
//   zip[filePath] = {type: "XmlString", xml: xml};
// }
//
// function addImageToArchive(zip: ZipMap, filePath: string, ms: AbstractImage, renderScale: number, renderFormat: string): void {
//   zip[filePath] = {type: "AbstractImage", image: ms, renderScale, renderFormat};
// }
