/* eslint-disable @typescript-eslint/no-misused-promises */
import React from "react";
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import * as AI from "../../../abstract-image/src/index.js";
import * as HSXML from "../../../handlebars-xml/src/index.js";
import {
  AbstractDoc as AD,
  AbstractDocExporters,
  AbstractDocXml as ADXml,
} from "../../../abstract-document/src/index.js";

export function AbstractDocumentXMLExample(): React.JSX.Element {
  const [pdf, setPdf] = React.useState<{ type: "Ok"; url: string } | { type: "Err"; error: string } | undefined>(
    undefined
  );
  const [data, setData] = React.useState('{ "test": "Hello world", "truthy": true, "falsy": false }');
  const [template, setTemplate] = React.useState(`<AbstractDoc>
    {{#*inline "inlinePartial"}}
        <TextCell text="Testing inline partial" />
    {{/inline}}
    <StyleNames>
        <StyleName name="footerResultText" type="TextStyle" fontSize="8" color="#353535" bold="true"/>
        <StyleName name="footerResultCell" type="TableCellStyle" padding="4 4 3 0" borders="1 0 0 0" borderColor="#123151" verticalAlignment="Bottom"/>
    </StyleNames>
    <Section>
        <Table columnWidths="200,70,60, 60">
            <style margins="150 0 0 0"/>
            <TableRow>
                <TableCell styleName="footerResultCell"/>
                <TextCell text="{{test}}" styleNames="footerResultText, footerResultCell"/>
                <TextCell text="Price €" styleNames="footerResultText, footerResultCell"/>
                {{#truthy}}
                <TextCell text="Price2 €" styleNames="footerResultText, footerResultCell"/>
                {{/truthy}}
                {{#falsy}}
                <TextCell text="Price3 €" styleNames="footerResultText, footerResultCell"/>
                {{/falsy}}
            </TableRow>
            <ImageRow src="${wiringDiagramUrl}" height="100" width="300"/>
            <TableRow>
                {{> inlinePartial}}
            </TableRow>
          {{>partial}}
        </Table>
    </Section>
  </AbstractDoc>`);

  const [partial, setPartial] = React.useState(`<TableRow>
    <TextCell text="{{test}}!" />
</TableRow>`);

  return (
    <div style={{ display: "flex", margin: "10px 0 0 10px", gap: "10px", width: "100%", height: "calc(100% - 40px)" }}>
      <div style={{ display: "flex", flexDirection: "column", width: "25%", height: "100%", gap: "10px" }}>
        <span>Data</span>
        <textarea
          style={{ width: "100%", height: "calc(100% - 30px)" }}
          value={data}
          onChange={(e) => setData(e.currentTarget.value)}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: "43%", height: "100%", gap: "10px" }}>
        <span>Template</span>
        <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%", gap: "10px" }}>
          <textarea
            style={{ width: "100%", height: "calc(100% - 30px)" }}
            value={template}
            onChange={(e) => setTemplate(e.currentTarget.value)}
          />
        </div>

        <span>Partial ("partial")</span>
        <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%", gap: "10px" }}>
          <textarea
            style={{ width: "100%", height: "calc(100% - 30px)" }}
            value={partial}
            onChange={(e) => setPartial(e.currentTarget.value)}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "32%",
          height: "100%",
        }}
      >
        <button onClick={async () => setPdf(await generatePDF(data, template, { partial }))}>Generate PDF</button>
        {pdf?.type === "Err" ? (
          <h3>{pdf.error}</h3>
        ) : (
          <embed
            src={pdf?.type === "Ok" ? pdf.url : undefined}
            type="application/pdf"
            style={{ width: "100%", height: "calc(100% - 30px)" }}
          />
        )}
      </div>
    </div>
  );
}

async function generatePDF(
  data: string,
  template: string,
  partials: Record<string, string>
): Promise<{ type: "Ok"; url: string } | { type: "Err"; error: string }> {
  let dataObject = {};
  try {
    dataObject = JSON.parse(data);
  } catch (e) {
    return { type: "Err", error: "Failed to parse JSON." + e };
  }
  const handlebarsRendered = HSXML.renderHandlebars(template, dataObject, partials);
  const validationErrors = HSXML.validateXml(handlebarsRendered, ADXml.parsedXsd);
  if (validationErrors.length > 0) {
    return { type: "Err", error: HSXML.errorToReadableText(validationErrors, "template") };
  }

  // Fetch image and fonts once the ADXml has been parsed
  const [doc, _ignored_imageUrls, _ignored_fontFamilies] = ADXml.abstractDocXml(templateTest, dataTest, partialsTest);
  console.log("doc", doc);
  const docWithResources = AD.AbstractDoc.addResources(doc, { imageResources });
  const blob: Blob = await AbstractDocExporters.Pdf.exportToHTML5Blob(PDFDocument, docWithResources);
  const objectURL = URL.createObjectURL(blob);
  return { type: "Ok", url: objectURL };
}

const wiringDiagramUrl = "./wiring-diagram";

const pngBase64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAACWCAIAAAAUvlBOAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAwaSURBVHhe7Z0/T9tcG4d5X8WWW0OU0MgFKRKKGnXojL8BUhFTN8asMLwLYmNmq1g6lJWRrVNFpXyDZO5QpYqQIkGj9EmUJ24t28NrJy6N49uxj+1DnPC7FOlxeKgJ9sV93+ePz/nPz3J1DYC0+a/7XwBSBWIBLkAswAWIBbgAsQAXIBbgAsQCXIBYgAsQC3ABYgEuQCzABYgFuACxABcgFuACxAJcgFiACxALcAFiAS5ALMAFiAW4ALEAFyAW4ALEAlyAWIALEAtwAU9Ch2GZdV37bI6+mmsNQ3e/OEYVpbU18c1z8UCS93KC+1UwJjWx6v3Ooea57gSipNp3QhAPNiLdifaoezwYNtx3fxClWv7lhRThRurd/d7UPxfz55vKUc59F4ZZH/Xf+396MKqYP90swrAJKYmld1/0hu5xVCRVLn4syhX3rQ9rsH/fC7qvamHnZj3kFtb7rUPNPZ5QK1Uv7CgTRlvvHk8byYIqlz4WC4G/1JNhgTWW3tDudjudS8t9P4tlzLm1jcGPwH+YCPOy29qNa5VNQ+sdj0z3zRNm4cW7fnbfOQlLoRT62b/ecJQcSzvp3J4Z7rvYNMzEp1h+stAq1K963bp7zILWTzVoaSf3d1fusQ+7PittN7eqduXw8Gpu7VyXSjWnhAezcBTLLoOmb8NP+zYU8qr7P2cYHvZjhJ8Ug5adAQOsEvPXtk+KciTJFW/hX8kJe1LhQin/LO80S3lVdL8ObB4xYtm3YV25KW/X3PdeNC08aDmNSi/aXaw0Okt79IPOgPJ2U1H2whuSQkVSbpSqo5f9FyVAsQWkQvliq0TFLaMVmteE9Xe+W3Y1HLTdw9hoHwaUnmKpOafRSuHoVa6GNlefAouosXKy3w87r30LL5iEo3zePXzA6H1IFrTaoz6VBPPXCnoN4rOQ4l2oUn/SX60IrXSpeJ5y0DK//CLEVAvFPfcQxGEhYiWBDlrxu44s7RNRXeVPkc6SsRCxzBalwZvQwRDTdCKTJPvL/8agH6fDwulkHxF9obKMcJWQhYhlfCOChPQ66iie/L+Cv+to+D5W0PpuEnmw9kx2j0BcFiBWQLEsVqOKtVZZf+mvtGIN8pCxM7riIJBHF8saHJNte7bsQ1VacfpLydgZoLjefdFphb+6sUYRVo7HE6ttmfV+5wU9YUE632DMPlTzMO1BHg9tK9oIoBEzKa8YHMVqDG6n/5R372+DJmyphZeRp0k9kEbQssyv7tEUovjKPfJAVmMkGIS2WUjx7kGVt2N2VdNBK/Egj2F8d488vBIw2MzAgsVy5usVYzfByKDF0l+aE964R+FUcsRwAQhiYWKpcul6K/GwGhm0kg7yBIxaSopnssbkRY97gkcVS1JFqSaXzks7zXL1pliIMGsglIRBS3xNhKEoo5YgBI5izc7HKpdvlPJFsXAkCWkO7krKtT+XRg1aCUYtwVwWX7wnZ2+DyEd20FqLUG7vPSMCXuOXlngqzlNnFcRayxVOiaA1+hwl7uREokhKPBUHrIRYdNDSr0Kfc7ShJ4elMn/wSbMiYtFBKxJ0+Z9oKg5YHbECKq1IkH0W45GDfbgVl9URK1HQ2qSldNzqD+rofWBnhcRKErRyhZsSlRBtt7Te4X1rv9u91M32lGFtS7vsd+YsAvDEWSmxEgQtpz+sScwfdGkYw7Pe7e799Jj63Zmmw6ogVkssO2gVA55bjEBlvTx5MDAheK7QZtXEcp5bDEhqUXAeDNzariUSQ3oXZYmlVSclsXLyzBIGqphPen0l+5zu4Rip9jza46N2UrMDz6wcUq2wE2UNI/t3uVCqTUcvtnky9q88HgYts88tW0Gwol8IbV378lv75Mzd0xueCXyS464gvhPkqiRivbUZIBbgwurVWCATQCzABYgFuACxABcgFuACxAJcgFiACxALcAFiAS5ALMAFiAW4ALEAFyAW4ALEAlyAWIALEAtwAWIBLkAswAWIBbgAsQAXIBbgAsQCXIBYgAsQC3ABYgEuQCzABYgFuACxABewKMiCsMy6rn02R1/NtYbhWTZcdZZPEt88Fw8keXkXsUlJLEs7+ad/NXWBnPWxNhVypaj2qHs8GBKLLIqSKhQ/FqMtguWlrQ+Ohz3vMkMuzgZjTFtBWYOTf3pX/lOJ+fOA34gFsz7qvyd//QDsK3m6WZxjWL3fCdoIci7S+RbHpbxSEkvvvugN3eM/0HfUGoQsCCuWmkqBzS3qp09TK1UjLbk2pt5vHQZtphnjs03R1rvHPQalplHl0sci9aNDr2cwTJeFlUevsSwj5Cowr9xvXg7nWWXDsumS9nnOFq3G6EvMpbnNy25rN65VNg0t4LKEXs8FkcXinW2PJL1/luJOubpG7bD/gP5JZ99SwK4TOrfJP+Ry7QicyVYhS2Co/w4JV0yEno19YzDt5P4uUFZn2dLt5tb05nvV5tbOdanEugIqO9JrnmulZkGsfG12cfbogcGXuewWgHsUg7l5cAJbNrQzYIBVYv7a9klRjiS54r3BlZywJxUulPLP8g61Sm84vp0iyRffRXgzEbEOfJsGNgb9uns4j/aoP3Pb1Ofr0bd5noE4m+xf9p0hG7ZHP+gMKG83FSXCBrOCszy4Up2sPr9cy8dnIxVKsm/V/+Hn8Ba0+eXXzDflT+NvMu0/m/Ruo+jfdC6i9Hb8+zCgfge7acnYpeLoVU68f/bjkpEaSz7wbVVy9TssLVnap5l4IMt77hE7/rOJ629zwtvn/lonivRE/BuTv07QYbFEZKV4J7bQ1bT5gaGtj2Za2rVnsXfSIc6mjvcrqEjr/qItXHoi/jmohWJ89ZeKrIjFng39iSZ/EL8hReXByc4a5BasYdIT8c8hSaZeMjIjFms29Hc4pZ8HJ0dxsqE//jkk+YTLRnbEIrNh/zKgbe/vcOKRByfEyIbfTcK7JJ9w6ciQWFQ2DGrb+zuckuRBf1b17uDFnA3NFvGp+XZITtMY3D7sq0i+TuaG21TIklhUNiR7uokOpyRFsT+r/s2DE+hs+D5wTNP4RhRYYpUUS+/O3HX61e1G6+OIBMvgaUwyJRa19y7R0x1caMfCn1Wn8+AEMhuyD+8QtC3CQQJjjsdZJFtiUUnHlw3nFdox8GdVSlMyGwYN71jmV/doClF85R55IKsxEgxCJ4FIOjM93fMLbWbC8+AEMhuyTHYwjO/ukYdXQvzaMDZv+E9MzZpYZNKZbtuHFdqMRMmDExiyYU6IPl5ZyfkjYVJCB6H5ze97IHNikUnnb9s+aoCJSLQ8OIEpGxIYLfI7JWXmrjuvLV+tuWxkTywy6fxp20cPMFEghvPmaRo9G4qviTCkf4uq4CqQQbGCs6E1eB89wIRDDecZvd2Zdv7Ua5earUBNdhCq1Id6hEZ+dsiiWHQ2HA7q/nESuRh/tho9nBcDYniHGEVIqXtiWcikWGTSMXqHvoCR7jBObIjhnZxIFElG7wMR8laTbIpFN8F8pDudIQH+4R2y0h/H3ScStDIqVtCN8ZDudIZE+LOhcJQnsiH7w23LSlbFoptgHtLOg/nrmTZ/wKtZID4YkQ2l4jn1t9EY3O4/AbcyK1ZoNkw7D0aOf/QHIyY7CEebdHeU41Z/UF/p3ofsihWSDZPkQeoZV4ZnYOgPRg0S5wo3JSoh2m5pvcP71n63e6mb7SnD2pZ22e/Efmp+Qui0mfGrEzTXLRUyLFZQmeIgnW/Ez4PUU6lM/WF0mqZ7EySFTJ0TGsbwrHe7e//3fu/e351pelrN1bmwDHSyk2Wx7Lvin/o3JuVhHOYT0tkwYHinsl6ePBiYEDxXmCLE1D+blKczxDghnQ0DY4DzYODWdi2RGAExlewwywApiZWTZ9YacNbHCrgQ3u+UVJmeqDRhb8N3P8T5z7rYLnqfsp/5JL47oYol9odnhLd5fxCS5k1HyckXSrXp6MXW6LCv5Hlppxn0RHyucCqznfAPiWaFhIIV/RZDW9e+/NY+OXP3dO96cZKzWIMgvhPkqiQ++RX9APCS8RoLLCsQC3ABYgEuQCzABYgFuACxABcgFuACxAJcgFiACxALcAFiAS5ALMAFiAW4ALEAFyAW4ALEAlyAWIALEAtwAWIBLkAswAWIBbgAsQAXIBbgAsQCHFhb+z9FDDmDWJC9LAAAAABJRU5ErkJggg==";

const imageResources: Record<string, AD.ImageResource.ImageResource> = {
  [wiringDiagramUrl]: AD.ImageResource.create({
    id: wiringDiagramUrl,
    abstractImage: AI.createAbstractImage(AI.createPoint(0, 0), AI.createSize(200, 100), AI.white, [
      AI.createBinaryImage(AI.createPoint(0, 0), AI.createPoint(200, 100), "png", {
        type: "url",
        url: pngBase64,
      }),
    ]),
  }),
};

/* eslint-disable max-lines */

const templateTest = `<AbstractDoc>
    <StyleNames>
        {{>styles}}
    </StyleNames>
    <Section>
        {{>common-page}}
        <!-- Content - Hämta produktinformation, image/text product och visualizers -->
        <Paragraph>
            <style margins="3 0 3 0"/>
        </Paragraph>
        <Table columnWidths="505">
            {{#visualizer.visualizers}}
            {{#visualizerFlags.short_key}}
            <TableRow>
                <TextCell text="{{text}}" styleNames="textProductName"/>
            </TableRow>
            {{/visualizerFlags.short_key}}
            {{/visualizer.visualizers}}
            {{#visualizer.visualizers}}
            {{#visualizerFlags.ProductCode}}
            <TableRow>
                <TextCell text="{{text}}" styleNames="textProductCode"/>
            </TableRow>
            {{/visualizerFlags.ProductCode}}
            {{/visualizer.visualizers}}
            <TableRow>
                <TextCell text="{{texts.product.product_description}}" styleNames="textProductDescription"/>
            </TableRow>
        </Table>
        <Table columnWidths="250,255">
            <TableRow>
                <!-- Rubrik produkt och bild - Nästlad tabell, kan inte sätta höjd på första cellen -->
                <TableCell styleName="tableProductName">
                    <Table columnWidths="250">
                        <TableRow>
                            <ImageCell src="{{#images.product}}{{#imageFlags.name_productprint}}{{url}}{{/imageFlags.name_productprint}}{{/images.product}}" width="200" height="130" styleNames="tableProductImage"/>
                        </TableRow>
                    </Table>
                </TableCell>
                <TableCell>
                </TableCell>
            </TableRow>
        </Table>
        <Paragraph>
            <style margins="0 0 0 0"/>
        </Paragraph>
        <!-- Productbeskrivning - Lyckas inte sätta formatering på textstycke formaterat med markdown -->
        <Table columnWidths="250,255">
            <TableRow>
                <!-- <TextCell text="{{texts.product.description}}"/> -->
                <TableCell>
                    <Markdown text="{{texts.product.description}}"/>
                </TableCell>
            </TableRow>
        </Table>
        <Paragraph>
            <style margins="3 0 0 0"/>
        </Paragraph>
        <!-- <PageBreak/> -->
        <!-- Tabell - Vald produkt -->
        <Table columnWidths="250,255">
            <TableRow>
                <TableCell>
                    <!-- ********** TABELL - ORDERING CODE ********** -->
                    {{#visualizer.visualizers}}
        {{#visualizerFlags.tech_ordering_code}}
                    <Table columnWidths="165,340">
                        <TableRow>
                            <!-- ********** FULL ORDERING CODE NAME ********** -->
                            <TextCell text="{{texts.report.tech_ordering_code}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        <TableRow>
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                        </TableRow>
                    </Table>
                    <Paragraph>
                        <style margins="0 0 10 0"/>
                    </Paragraph>
                    {{/visualizerFlags.tech_ordering_code}}
        {{/visualizer.visualizers}}
                    <!-- ********** FULL PRODUCT NAME ********** -->
                    <!-- ********** TABELL - PRODUCT SELECTION - tech ********** -->
                    {{#visualizer.visualizers}}
        {{#visualizerFlags.tech}}{{#table}}
                    <Table columnWidths="150,100">
                        <TableRow>
                            <!-- ********** FULL PRODUCT SELECTION - tech - NAME ********** -->
                            <TextCell text="{{texts.report.selection}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        {{#rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/rows}}
                    </Table>
                    <Paragraph>
                        <style margins="0 0 10 0"/>
                    </Paragraph>
                    {{/table}}{{/visualizerFlags.tech}}
        {{/visualizer.visualizers}}
                    <!-- ********** TABELL - ACCESSORIES ********** -->
                    {{#visualizer.visualizers}}
        {{#visualizerFlags.accessories}}{{#table}}
                    <Table columnWidths="150,100">
                        <TableRow>
                            <!-- ********** FULL ACCESSORIES NAME ********** -->
                            <TextCell text="{{texts.report.accessories}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        {{#rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/rows}}
                    </Table>
                    <Paragraph>
                        <style margins="0 0 10 0"/>
                    </Paragraph>
                    {{/table}}{{/visualizerFlags.accessories}}
        {{/visualizer.visualizers}}
                    <!-- ********** TABELL - ACTUATOR ********** -->
                    <Table columnWidths="inf,inf">
                        <TableRow>
                            <TableCell>
                                {{#visualizer.visualizers}}
                    {{#visualizerFlags.actuator}}{{#table}}
                                <Table columnWidths="150,100">
                                    <TableRow>
                                        <!-- ********** FULL ACTUATOR NAME ********** -->
                                        <TextCell text="{{texts.report.actuator}}" styleNames="tableColumnHeader"/>
                                    </TableRow>
                                    {{#rows}}
                                    <TableRow>
                                        {{#cells}}
                                        <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                                        {{/cells}}
                                    </TableRow>
                                    {{/rows}}
                                </Table>
                                <Paragraph>
                                    <style margins="0 0 10 0"/>
                                </Paragraph>
                                {{/table}}{{/visualizerFlags.actuator}}
                    {{/visualizer.visualizers}}
                            </TableCell>
                            <TableCell styleName="alignTop">
                                {{#visualizer.visualizers}}
                    {{#visualizerFlags.actuator2}}{{#table}}
                                <Table columnWidths="150,100">
                                    <TableRow>
                                        <!-- ********** FULL ACTUATOR2 NAME ********** -->
                                        <TextCell text="{{texts.report.actuator2}}" styleNames="tableColumnHeader"/>
                                    </TableRow>
                                    {{#rows}}
                                    <TableRow>
                                        {{#cells}}
                                        <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                                        {{/cells}}
                                    </TableRow>
                                    {{/rows}}
                                </Table>
                                <Paragraph>
                                    <style margins="0 0 10 0"/>
                                </Paragraph>
                                {{/table}}{{/visualizerFlags.actuator2}}
                    {{/visualizer.visualizers}}
                            </TableCell>
                        </TableRow>
                    </Table>
                    <!-- ********** TABELL - INPUT DATA - perf_tech ********** -->
                    {{#visualizer.visualizers}}
        {{#visualizerFlags.perf_tech}}{{#table}}
                    <Table columnWidths="150,100">
                        <TableRow>
                            <!-- ********** FULL INPUT DATA - perf_tech - NAME ********** -->
                            <TextCell text="{{texts.report.perfcase}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        {{#rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/rows}}
                    </Table>
                    <Paragraph>
                        <style margins="0 0 10 0"/>
                    </Paragraph>
                    {{/table}}{{/visualizerFlags.perf_tech}}
        {{/visualizer.visualizers}}
                    <!-- ********** TABELL - ROOM ********** -->
                    {{#visualizer.visualizers}}
        {{#visualizerFlags.room}}{{#table}}
                    <Table columnWidths="150,100">
                        <TableRow>
                            <!-- ********** FULL ROOM NAME ********** -->
                            <TextCell text="{{texts.report.room}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        {{#rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/rows}}
                    </Table>
                    <Paragraph>
                        <style margins="0 0 10 0"/>
                    </Paragraph>
                    {{/table}}{{/visualizerFlags.room}}
        {{/visualizer.visualizers}}
                    <!-- ********** TABELL - CALCULATION RESULTS - spec ********** -->
                    {{#visualizer.visualizers}}
        {{#visualizerFlags.spec}}{{#table}}
                    <Table columnWidths="150,100">
                        <TableRow>
                            <!-- ********** FULL CALCULATION RESULTS - spec - NAME ********** -->
                            <TextCell text="{{texts.report.specheader}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        {{#rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/rows}}
                    </Table>
                    <Paragraph>
                        <style margins="0 0 10 0"/>
                    </Paragraph>
                    {{/table}}{{/visualizerFlags.spec}}
        {{/visualizer.visualizers}}
                </TableCell>
                <TableCell styleName="alignTop">
                    <Table columnWidths="255">
                        {{#visualizer.visualizers}}{{#visualizerFlags.chart}}
                        <TableRow>
                            <!-- Dynamic image from calculation -->
                            <ImageCell src="{{#image}}{{url}}{{/image}}" width="250" height="150">
                                <paragraphStyle margins="0 0 0 0"/>
                            </ImageCell>
                        </TableRow>
                        {{/visualizerFlags.chart}}{{/visualizer.visualizers}}
                    </Table>
                </TableCell>
            </TableRow>
        </Table>
        <!-- Tabell - Sound -->
        {{#visualizer.visualizers}}
        {{#visualizerFlags.sound}}{{#table}}
        <Table columnWidths="540">
            <style margins="0 0 0 0" alignment="Left">
                <cellStyle borders="0 0 0 0" padding="0 0 0 0" borderColor="#006400"></cellStyle>
            </style>
            <TableRow>
                <TableCell>
                    <Table columnWidths="100,0,inf,inf,inf,inf,inf,inf,inf,inf,inf,inf">
                        {{#table.rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#rowIndex0}}{{#cellIndex0}}tableColumnHeader{{/cellIndex0}}{{^cellIndex0}}headerCellMiddle,headerText{{/cellIndex0}}{{/rowIndex0}}{{^rowIndex0}}{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}{{/rowIndex0}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/table.rows}}
                    </Table>
                </TableCell>
            </TableRow>
        </Table>
        {{/table}}{{/visualizerFlags.sound}}
        {{/visualizer.visualizers}}
        <!-- ********** TABELL - PRODUKTVAL BAFFLAR - techbeams ********** -->
        <Table columnWidths="inf,inf">
            <TableRow>
                <TableCell>
                    {{#visualizer.visualizers}}
                    {{#visualizerFlags.techbeams}}{{#table}}
                    <Table columnWidths="165,140">
                        <TableRow>
                            <!-- ********** FULL techbeams NAME ********** -->
                            <TextCell text="{{texts.report.selection}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        {{#rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/rows}}
                    </Table>
                    {{/table}}{{/visualizerFlags.techbeams}}
                    {{/visualizer.visualizers}}
                </TableCell>
                <TableCell styleName="alignTop">
                    {{#visualizer.visualizers}}
                    {{#visualizerFlags.specbeamsair}}{{#table}}
                    <Table columnWidths="165,87">
                        <TableRow>
                            <!-- ********** FULL RESULTAT - specbeamsair NAME ********** -->
                            <TextCell text="{{texts.report.specbeams}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        {{#rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/rows}}
                    </Table>
                    {{/table}}{{/visualizerFlags.specbeamsair}}
                    {{/visualizer.visualizers}}
                </TableCell>
            </TableRow>
        </Table>
        <Paragraph>
            <style margins="0 0 10 0"/>
        </Paragraph>
        <!-- ********** TABELL - INPUT BAFFLAR COOLING - perf_techcooling ********** -->
        <Table columnWidths="inf,inf">
            <TableRow>
                <TableCell styleName="alignTop">
                    {{#visualizer.visualizers}}
                    {{#visualizerFlags.perf_techcooling}}{{#table}}
                    <Table columnWidths="165,140">
                        <TableRow>
                            <!-- ********** FULL perf_techcooling NAME ********** -->
                            <TextCell text="{{texts.report.perf_techcooling}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        {{#rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/rows}}
                    </Table>
                    {{/table}}{{/visualizerFlags.perf_techcooling}}
                    {{/visualizer.visualizers}}
                </TableCell>
                <TableCell styleName="alignTop">
                    {{#visualizer.visualizers}}
                    {{#visualizerFlags.cooling}}{{#table}}
                    <Table columnWidths="165,87">
                        <TableRow>
                            <!-- ********** FULL RESULTAT BAFFLAR COOLING - cooling NAME ********** -->
                            <TextCell text="{{texts.report.cooling}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        {{#rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/rows}}
                    </Table>
                    {{/table}}{{/visualizerFlags.cooling}}
                    {{/visualizer.visualizers}}
                </TableCell>
            </TableRow>
        </Table>
        <Paragraph>
            <style margins="0 0 10 0"/>
        </Paragraph>
        <!-- ********** TABELL - INPUT BAFFLAR HEATING - perf_techheating ********** -->
        <Table columnWidths="inf,inf">
            <TableRow>
                <TableCell styleName="alignTop">
                    {{#visualizer.visualizers}}
                    {{#visualizerFlags.perf_techheating}}{{#table}}
                    <Table columnWidths="165,140">
                        <TableRow>
                            <!-- ********** FULL perf_techheating NAME ********** -->
                            <TextCell text="{{texts.report.perf_techheating}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        {{#rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/rows}}
                    </Table>
                    {{/table}}{{/visualizerFlags.perf_techheating}}
                    {{/visualizer.visualizers}}
                </TableCell>
                <TableCell styleName="alignTop">
                    {{#visualizer.visualizers}}
                    {{#visualizerFlags.heating}}{{#table}}
                    <Table columnWidths="165,87">
                        <TableRow>
                            <!-- ********** FULL RESULTAT BAFFLAR HEATING - heating NAME ********** -->
                            <TextCell text="{{texts.report.heating}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        {{#rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/rows}}
                    </Table>
                    {{/table}}{{/visualizerFlags.heating}}
                    {{/visualizer.visualizers}}
                </TableCell>
            </TableRow>
        </Table>
        <Paragraph>
            <style margins="0 0 0 0"/>
        </Paragraph>
        <!-- ********** TABELL - ROOM BEAMS - roombeams ********** -->
        {{#visualizer.visualizers}}
        {{#visualizerFlags.roombeams}}{{#table}}
        <Table columnWidths="165,87">
            <TableRow>
                <!-- ********** FULL ROOM BEAMS - roombeams - NAME ********** -->
                <TextCell text="{{texts.report.roombeams}}" styleNames="tableColumnHeader"/>
            </TableRow>
            {{#rows}}
            <TableRow>
                {{#cells}}
                <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                {{/cells}}
            </TableRow>
            {{/rows}}
        </Table>
        {{/table}}{{/visualizerFlags.roombeams}}
        {{/visualizer.visualizers}}
        <!-- Tabell - Sound beams -->
        {{#visualizer.visualizers}}
        {{#visualizerFlags.soundbeams}}{{#table}}
        <Table columnWidths="540">
            <style margins="0 0 0 0" alignment="Left">
                <cellStyle borders="0 0 0 0" padding="20 0 0 0" borderColor="#006400"></cellStyle>
            </style>
            <TableRow>
                <TableCell>
                    <Table columnWidths="100,0,inf,inf,inf,inf,inf,inf,inf,inf,inf,inf">
                        {{#table.rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#rowIndex0}}{{#cellIndex0}}tableColumnHeader{{/cellIndex0}}{{^cellIndex0}}headerCellMiddle,headerText{{/cellIndex0}}{{/rowIndex0}}{{^rowIndex0}}{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}{{/rowIndex0}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/table.rows}}
                    </Table>
                </TableCell>
            </TableRow>
        </Table>
        {{/table}}{{/visualizerFlags.soundbeams}}
        {{/visualizer.visualizers}}
        <!-- TABELL 1: project och configAtt -->
        <Table columnWidths="252,252">
            <TableRow>
                <TableCell styleName="alignTop">
                    {{#visualizer.visualizers}}
      {{#visualizerFlags.configAtt}}{{#table}}
                    <Table columnWidths="120,87">
                        <TableRow>
                            <TextCell text="{{texts.report.configAtt}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        {{#rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/rows}}
                    </Table>
                    <Paragraph>
                        <style margins="0 0 20 0"/>
                    </Paragraph>
                    {{/table}}{{/visualizerFlags.configAtt}}
      {{/visualizer.visualizers}}
                </TableCell>
                <TableCell styleName="alignTop">
                    {{#visualizer.visualizers}}
      {{#visualizerFlags.project}}{{#table}}
                    <Table columnWidths="120,87">
                        <TableRow>
                            <TextCell text="{{texts.report.project}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        {{#rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/rows}}
                    </Table>
                    <Paragraph>
                        <style margins="0 0 20 0"/>
                    </Paragraph>
                    {{/table}}{{/visualizerFlags.project}}
      {{/visualizer.visualizers}}
                </TableCell>
            </TableRow>
        </Table>
        <!-- TABELL 2: airAtt och attenuatorAir -->
        <Table columnWidths="252,252">
            <TableRow>
                <TableCell styleName="alignTop">
                    {{#visualizer.visualizers}}
      {{#visualizerFlags.airAtt}}{{#table}}
                    <Table columnWidths="120,87">
                        <TableRow>
                            <TextCell text="{{texts.report.airAtt}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        {{#rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/rows}}
                    </Table>
                    <Paragraph>
                        <style margins="0 0 20 0"/>
                    </Paragraph>
                    {{/table}}{{/visualizerFlags.airAtt}}
      {{/visualizer.visualizers}}
                </TableCell>
                <TableCell styleName="alignTop">
                    {{#visualizer.visualizers}}
      {{#visualizerFlags.attenuatorAir}}{{#table}}
                    <Table columnWidths="120,87">
                        <TableRow>
                            <TextCell text="{{texts.report.attenuatorAir}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        {{#rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/rows}}
                    </Table>
                    <Paragraph>
                        <style margins="0 0 20 0"/>
                    </Paragraph>
                    {{/table}}{{/visualizerFlags.attenuatorAir}}
      {{/visualizer.visualizers}}
                </TableCell>
            </TableRow>
        </Table>
        <!-- TABELL 3: inputFanAtt och attenuatorSound -->
        <Table columnWidths="252,252">
            <TableRow>
                <TableCell styleName="alignTop">
                </TableCell>
                <TableCell styleName="alignTop">
                    {{#visualizer.visualizers}}
      {{#visualizerFlags.attenuatorSound}}{{#table}}
                    <Table columnWidths="120,87">
                        <TableRow>
                            <TextCell text="{{texts.report.attenuatorSound}}" styleNames="tableColumnHeader"/>
                        </TableRow>
                        {{#rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/rows}}
                    </Table>
                    <Paragraph>
                        <style margins="0 0 20 0"/>
                    </Paragraph>
                    {{/table}}{{/visualizerFlags.attenuatorSound}}
      {{/visualizer.visualizers}}
                </TableCell>
            </TableRow>
        </Table>
        <!-- Tabell - Fan noise input & attenuator results, octave bands -->
        {{#visualizer.visualizers}}
        {{#visualizerFlags.soundHz}}{{#table}}
        <Table columnWidths="505">
            <style margins="0 0 0 0" alignment="Left">
                <cellStyle borders="0 0 0 0" padding="0 0 3 0" borderColor="#006400"></cellStyle>
            </style>
            <TableRow>
                <TextCell text="{{texts.report.soundAttenuation}}" styleNames="tableColumnHeader"/>
            </TableRow>
            <TableRow>
                <TableCell>
                    <Table columnWidths="inf,inf,inf,inf,inf,inf,inf,inf">
                        {{#table.rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#rowIndex0}}{{#cellIndex0}}headerBoldText{{/cellIndex0}}{{^cellIndex0}}headerBoldText{{/cellIndex0}}{{/rowIndex0}}{{^rowIndex0}}{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}{{/rowIndex0}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/table.rows}}
                    </Table>
                </TableCell>
            </TableRow>
        </Table>
        <Paragraph>
            <style margins="0 0 10 0"/>
        </Paragraph>
        {{/table}}{{/visualizerFlags.soundHz}}
        {{/visualizer.visualizers}}
       {{#visualizer.visualizers}}
        {{#visualizerFlags.inputFanAtt}}{{#table}}
        <Table columnWidths="505">
            <style margins="0 0 0 0" alignment="Left">
                <cellStyle borders="0 0 0 0" padding="0 0 3 0" borderColor="#006400"></cellStyle>
            </style>
            <TableRow>
                <TextCell text="{{texts.report.inputFanAtt}}" styleNames="tableColumnHeader"/>
            </TableRow>
            <TableRow>
                <TableCell>
                    <Table columnWidths="inf,inf,inf,inf,inf,inf,inf,inf">
                        {{#table.rows}}
                        <TableRow>
                            {{#cells}}
                            <TextCell text="{{text}}" styleNames="{{#rowIndex0}}{{#cellIndex0}}headerBoldText{{/cellIndex0}}{{^cellIndex0}}headerBoldText{{/cellIndex0}}{{/rowIndex0}}{{^rowIndex0}}{{#isEvenRow}}oddCell,textLeft{{/isEvenRow}}{{^isEvenRow}}evenCell,textLeft{{/isEvenRow}}{{/rowIndex0}}" columnSpan="{{colSpan}}"/>
                            {{/cells}}
                        </TableRow>
                        {{/table.rows}}
                    </Table>
                </TableCell>
            </TableRow>
        </Table>
        {{/table}}{{/visualizerFlags.inputFanAtt}}
        {{/visualizer.visualizers}}
        <!-- Text notes -->
        {{#node.report}}
        {{#notes.value}}
        <Table columnWidths="inf">
            <TableRow>
                <TextCell styleNames="tableColumnHeader" text="{{texts.report.p_standard_notes}}"/>
            </TableRow>
            <TableRow>
                <TextCell styleNames="textLeft" text="{{notes.value}}"/>
            </TableRow>
        </Table>
        {{/notes.value}}
        {{/node.report}}
    </Section>
</AbstractDoc>`;

const dataTest = {
  common: {
    date: "2025-08-31",
    userEmail: "email",
    userName: "userName",
    fonts: {
      PFSquareSansPro: true,
    },
    flags: {},
  },
  images: {
    report: [
      {
        url: "promaster://kb/54e078500b5ae798832296002b7a4bb4b03027da/kb-printout.png",
        imageFlags: {
          name_kb: true,
          type_: true,
        },
        name_kb: true,
        type_: true,
      },
    ],
    product: [
      {
        url: "promaster://kb/46e1213b610de00948269393407d156923565ae8/DCR_product_600px.webp",
        imageFlags: {
          name_tree: true,
          type_: true,
        },
        name_tree: true,
        type_: true,
      },
      {
        url: "promaster://kb/46e1213b610de00948269393407d156923565ae8/DCR_product_600px.webp",
        imageFlags: {
          name_product: true,
          type_catalog: true,
        },
        name_product: true,
        type_catalog: true,
      },
      {
        url: "promaster://kb/f0b4cc81ca94e8e681cf0d1c1859f537d2bb12ed/DCR-TK_product_600px.png",
        imageFlags: {
          name_productprint: true,
          type_: true,
        },
        name_productprint: true,
        type_: true,
      },
      {
        url: "promaster://kb/d754302c998b944e6d9b77160da1395134f92276/TKb_product_600px.webp",
        imageFlags: {
          name_boxTK: true,
          type_boxTK: true,
        },
        name_boxTK: true,
        type_boxTK: true,
      },
      {
        url: "promaster://kb/385165e6749fd680313d8e85d290879a5330b1d2/MN_product_600px.webp",
        imageFlags: {
          name_accessoryMN: true,
          type_accessoryMN: true,
        },
        name_accessoryMN: true,
        type_accessoryMN: true,
      },
      {
        url: "promaster://kb/58c4c767e4a1d2af177dcc4ec56bdf6aa4dc613f/DCR-TK_product_600px.webp",
        imageFlags: {
          "name_DCR-TK": true,
          "type_DCR-TK": true,
        },
        "name_DCR-TK": true,
        "type_DCR-TK": true,
      },
    ],
  },
  texts: {
    report: {
      test: "Test",
      p_standard_techdata: "Teknisk data",
      reservation: "Klimatbyrån AB förbehåller sig rätten till ändringar.",
      kb_link: "www.klimatbyran.se",
      empty_row: "",
      specbeams: "Beräkningsresultat (Luft)",
      specheader: "Resultat",
      perfcase: "Indata",
      accessories: "Tillbehör",
      actuator: "Ställdon",
      selection: "Produktval",
      actuator2: "Modbus",
      Nozzle: "Beräkningsresultat, luft",
      cooling: "Beräkningsresultat (Kyla)",
      heating: "Beräkningsresultat (Värme)",
      perf_techcooling: "Indata (Kyla)",
      perf_techheating: "Indata (Värme)",
      room: "Rum",
      roombeams: "Rum",
      techbeams: "Indata",
      p_standard_notes: "Anteckningar",
      tech_ordering_code: "Beställningskod",
      p_standard_date_time: "Inkludera datum i filnamnet",
      configAtt: "Produktval",
      attenuatorAir: "Luft - Resultat",
      attenuatorSound: "Ljud - Resultat",
      airAtt: "Luft - Input",
      inputFanAtt: "Fläktljuddata",
      project: "Projektinformation",
      soundAttenuation: "Ljuddämpning",
    },
    product: {
      pv_sleeve_nipple_1: "Ja",
      pv_sleeve_nipple_0: "Nej",
      pv_way_5: "Vertikal",
      p_standard_size: "Donstorlek",
      p_standard_way: "Spridningsbild",
      soundLp10A: "Ljud (Lp10A)",
      p_standard_box: "Ja",
      pv_box_1: "Ja",
      pv_box_0: "Nej",
      pv_way_4: "4-vägs",
      pv_way_3: "3-vägs",
      pv_way_2: "2-vägs",
      pv_way_1: "1-vägs",
      pv_way_0: "Rotation",
      p_standard_sleeve_nipple: "Muff/Nippel",
      p_standard_boxsize: "Ansl.storlek - låda",
      ductVelocity: "Hastighet i kanal",
      soundLwA: "Ljudeffekt (LwA)",
      soundLpA: "Ljudtryck (LpA)",
      soundLwABands: "Ljudeffekt (LwA)",
      p_standard_producttype: "Luftflöde",
      soundLpABands: "Ljudtryck (LpA)",
      throwLength: "Kastlängd (L0,2)",
      product_description: "Cirkulärt frihängande dysdon för tilluft",
      shortname: "DCR",
      accessory_code1: "Anslutningslåda",
      orderingCode: "Beställningskod",
      accessory_code2: "Muff/Nippel",
      p_standard_orderingCode: "Beställningskod",
      wallDistance: "Min. avstånd till vägg",
      diffuserDistance: "Min. avstånd mellan produkter",
      result: "Resultat",
      longdescription: "DCR....",
      mountingheight: "Montagehöjd",
      roomheight: "Takhöjd",
      minflowPressure: "Minflöde för att erhålla rek. mättryck",
      shortdescription: "Cirkulärt frihängande dysdon",
      webpagelink: "[Produktsida på Klimatbyråns hemsida](http://www.klimatbyran.se/web/DCR-TK.aspx)",
      webpageheader: "###Produktsida",
      productsheetheader: "###Produktblad",
      productsheetlink:
        "[Direktlänk till produktblad](http://www.klimatbyran.se/MediaBinaryLoader.axd?MediaArchive_FileID=78ad6d81-beb7-4f28-8bf4-f9a278ee26b7&MediaArchive_ForceDownload=True&Time_Stamp=638845645117963822)",
      shortnameHEADER: "##DCR + TK",
      soundLpA_short: "LpA",
      throwLength_short: "L0,2",
      damper_short: "Spjäl",
      ductVelocity_short: "Hastighet",
      p_standard_boxsize_short: "Ansl.strl.",
      KBdatasheet: " ",
      p_standard_roompropertiesCEILING: "Beräkna rumsegenskaper",
      p_long_roompropertiesCEILING:
        "Beräkna rumsdämpning (default 4dB) genom att bestämma rumstyp och rummets storlek.  \n\n\n",
      design_coolingEffect: "Kyleffekt",
      design_heatingEffect: "Värmeeffekt",
    },
  },
  visualizer: {
    visualizers: [
      {
        visualizerFlags: {
          spec: true,
        },
        spec: true,
        table: {
          name: "spec",
          tableFlags: {
            nbrRows10: true,
            nbrColumns2: true,
          },
          nbrRows10: true,
          nbrColumns2: true,
          rows: [
            {
              rowIndex0: true,
              rowFlags: {
                rowIndex0: true,
              },
              isHeader: false,
              isEvenRow: true,
              isMiddleRow: false,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Ljudtryck (LpA)",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "16 dB(A)",
                },
              ],
            },
            {
              rowIndex1: true,
              rowFlags: {
                rowIndex1: true,
              },
              isHeader: false,
              isEvenRow: false,
              isMiddleRow: true,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Rumsdämpning",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "4 dB",
                },
              ],
            },
            {
              rowIndex2: true,
              rowFlags: {
                rowIndex2: true,
              },
              isHeader: false,
              isEvenRow: true,
              isMiddleRow: true,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Ljudeffekt (LwA)",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "20 dB(A)",
                },
              ],
            },
            {
              rowIndex3: true,
              rowFlags: {
                rowIndex3: true,
              },
              isHeader: false,
              isEvenRow: false,
              isMiddleRow: true,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Kastlängd (L0,2)",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "0.6 m",
                },
              ],
            },
            {
              rowIndex4: true,
              rowFlags: {
                rowIndex4: true,
              },
              isHeader: false,
              isEvenRow: true,
              isMiddleRow: true,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Spjällets öppning",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "19.3 %",
                },
              ],
            },
            {
              rowIndex5: true,
              rowFlags: {
                rowIndex5: true,
              },
              isHeader: false,
              isEvenRow: false,
              isMiddleRow: true,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Kyleffekt",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "109 W",
                },
              ],
            },
            {
              rowIndex6: true,
              rowFlags: {
                rowIndex6: true,
              },
              isHeader: false,
              isEvenRow: true,
              isMiddleRow: true,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Värmeeffekt",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "-",
                },
              ],
            },
            {
              rowIndex7: true,
              rowFlags: {
                rowIndex7: true,
              },
              isHeader: false,
              isEvenRow: false,
              isMiddleRow: true,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Hastighet i kanal",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "1.9 m/s",
                },
              ],
            },
            {
              rowIndex8: true,
              rowFlags: {
                rowIndex8: true,
              },
              isHeader: false,
              isEvenRow: true,
              isMiddleRow: true,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Min. avstånd till vägg",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "0.4 m",
                },
              ],
            },
            {
              rowIndex9: true,
              rowFlags: {
                rowIndex9: true,
              },
              isHeader: false,
              isEvenRow: false,
              isMiddleRow: false,
              isLastRow: true,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Min. avstånd mellan produkter",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "0.8 m",
                },
              ],
            },
          ],
        },
      },
      {
        visualizerFlags: {
          chart: true,
        },
        chart: true,
        image: {
          url: "selector://kb/product/DCR/pressure-sound-chart/?soundType=0&download=true&showWorkingPoint=true&showAxisValues=true&throwLengthAxis=false&logarithmicX=true&logarithmicY=true&alternativesFilter=0&recommendedArea=false",
        },
      },
      {
        visualizerFlags: {
          alternatives: true,
        },
        alternatives: true,
        table: {
          name: "alternatives",
          tableFlags: {
            nbrRows2: true,
            nbrColumns5: true,
          },
          nbrRows2: true,
          nbrColumns5: true,
          rows: [
            {
              rowIndex0: true,
              rowFlags: {
                rowIndex0: true,
              },
              isHeader: true,
              isEvenRow: true,
              isMiddleRow: false,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Donstorlek",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Ansl.strl.",
                },
                {
                  cellFlags: {
                    cellIndex2: true,
                  },
                  cellIndex2: true,
                  isEvenCell: true,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "LpA [dB(A)]",
                },
                {
                  cellFlags: {
                    cellIndex3: true,
                  },
                  cellIndex3: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "L0,2 [m]",
                },
                {
                  cellFlags: {
                    cellIndex4: true,
                  },
                  cellIndex4: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "Hastighet [m/s]",
                },
              ],
            },
            {
              rowIndex1: true,
              rowFlags: {
                rowIndex1: true,
              },
              isHeader: false,
              isEvenRow: false,
              isMiddleRow: false,
              isLastRow: true,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "125",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "100",
                },
                {
                  cellFlags: {
                    cellIndex2: true,
                  },
                  cellIndex2: true,
                  isEvenCell: true,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "16",
                },
                {
                  cellFlags: {
                    cellIndex3: true,
                  },
                  cellIndex3: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "0.6",
                },
                {
                  cellFlags: {
                    cellIndex4: true,
                  },
                  cellIndex4: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "1.9",
                },
              ],
            },
          ],
        },
      },
      {
        visualizerFlags: {
          sound: true,
        },
        sound: true,
        table: {
          name: "sound",
          tableFlags: {
            nbrRows3: true,
            nbrColumns11: true,
          },
          nbrRows3: true,
          nbrColumns11: true,
          rows: [
            {
              rowIndex0: true,
              rowFlags: {
                rowIndex0: true,
              },
              isHeader: true,
              isEvenRow: true,
              isMiddleRow: false,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Ljud (Hz)",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "",
                },
                {
                  cellFlags: {
                    cellIndex2: true,
                  },
                  cellIndex2: true,
                  isEvenCell: true,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "63",
                },
                {
                  cellFlags: {
                    cellIndex3: true,
                  },
                  cellIndex3: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "125",
                },
                {
                  cellFlags: {
                    cellIndex4: true,
                  },
                  cellIndex4: true,
                  isEvenCell: true,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "250",
                },
                {
                  cellFlags: {
                    cellIndex5: true,
                  },
                  cellIndex5: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "500",
                },
                {
                  cellFlags: {
                    cellIndex6: true,
                  },
                  cellIndex6: true,
                  isEvenCell: true,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "1000",
                },
                {
                  cellFlags: {
                    cellIndex7: true,
                  },
                  cellIndex7: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "2000",
                },
                {
                  cellFlags: {
                    cellIndex8: true,
                  },
                  cellIndex8: true,
                  isEvenCell: true,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "4000",
                },
                {
                  cellFlags: {
                    cellIndex9: true,
                  },
                  cellIndex9: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "8000",
                },
                {
                  cellFlags: {
                    cellIndex10: true,
                  },
                  cellIndex10: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "",
                },
              ],
            },
            {
              rowIndex1: true,
              rowFlags: {
                rowIndex1: true,
              },
              isHeader: false,
              isEvenRow: false,
              isMiddleRow: true,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Ljudeffekt (LwA)",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "dB",
                },
                {
                  cellFlags: {
                    cellIndex2: true,
                  },
                  cellIndex2: true,
                  isEvenCell: true,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "21",
                },
                {
                  cellFlags: {
                    cellIndex3: true,
                  },
                  cellIndex3: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "22",
                },
                {
                  cellFlags: {
                    cellIndex4: true,
                  },
                  cellIndex4: true,
                  isEvenCell: true,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "22",
                },
                {
                  cellFlags: {
                    cellIndex5: true,
                  },
                  cellIndex5: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "21",
                },
                {
                  cellFlags: {
                    cellIndex6: true,
                  },
                  cellIndex6: true,
                  isEvenCell: true,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "11",
                },
                {
                  cellFlags: {
                    cellIndex7: true,
                  },
                  cellIndex7: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "3",
                },
                {
                  cellFlags: {
                    cellIndex8: true,
                  },
                  cellIndex8: true,
                  isEvenCell: true,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "0",
                },
                {
                  cellFlags: {
                    cellIndex9: true,
                  },
                  cellIndex9: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "0",
                },
                {
                  cellFlags: {
                    cellIndex10: true,
                  },
                  cellIndex10: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "dB",
                },
              ],
            },
            {
              rowIndex2: true,
              rowFlags: {
                rowIndex2: true,
              },
              isHeader: false,
              isEvenRow: true,
              isMiddleRow: false,
              isLastRow: true,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Ljuddämpning",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "dB",
                },
                {
                  cellFlags: {
                    cellIndex2: true,
                  },
                  cellIndex2: true,
                  isEvenCell: true,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "19",
                },
                {
                  cellFlags: {
                    cellIndex3: true,
                  },
                  cellIndex3: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "17",
                },
                {
                  cellFlags: {
                    cellIndex4: true,
                  },
                  cellIndex4: true,
                  isEvenCell: true,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "16",
                },
                {
                  cellFlags: {
                    cellIndex5: true,
                  },
                  cellIndex5: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "14",
                },
                {
                  cellFlags: {
                    cellIndex6: true,
                  },
                  cellIndex6: true,
                  isEvenCell: true,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "27",
                },
                {
                  cellFlags: {
                    cellIndex7: true,
                  },
                  cellIndex7: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "25",
                },
                {
                  cellFlags: {
                    cellIndex8: true,
                  },
                  cellIndex8: true,
                  isEvenCell: true,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "23",
                },
                {
                  cellFlags: {
                    cellIndex9: true,
                  },
                  cellIndex9: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "23",
                },
                {
                  cellFlags: {
                    cellIndex10: true,
                  },
                  cellIndex10: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "dB",
                },
              ],
            },
          ],
        },
      },
      {
        visualizerFlags: {
          tech: true,
        },
        tech: true,
        table: {
          name: "tech",
          tableFlags: {
            nbrRows2: true,
            nbrColumns3: true,
          },
          nbrRows2: true,
          nbrColumns3: true,
          rows: [
            {
              rowIndex0: true,
              rowFlags: {
                rowIndex0: true,
              },
              isHeader: false,
              isEvenRow: true,
              isMiddleRow: false,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Donstorlek",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "125",
                },
                {
                  cellFlags: {
                    cellIndex2: true,
                  },
                  cellIndex2: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "",
                },
              ],
            },
            {
              rowIndex1: true,
              rowFlags: {
                rowIndex1: true,
              },
              isHeader: false,
              isEvenRow: false,
              isMiddleRow: false,
              isLastRow: true,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Spridningsbild",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Rotation",
                },
                {
                  cellFlags: {
                    cellIndex2: true,
                  },
                  cellIndex2: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "",
                },
              ],
            },
          ],
        },
      },
      {
        visualizerFlags: {
          perf_tech: true,
        },
        perf_tech: true,
        table: {
          name: "perf_tech",
          tableFlags: {
            nbrRows4: true,
            nbrColumns2: true,
          },
          nbrRows4: true,
          nbrColumns2: true,
          rows: [
            {
              rowIndex0: true,
              rowFlags: {
                rowIndex0: true,
              },
              isHeader: false,
              isEvenRow: true,
              isMiddleRow: false,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Luftflöde",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "15 l/s",
                },
              ],
            },
            {
              rowIndex1: true,
              rowFlags: {
                rowIndex1: true,
              },
              isHeader: false,
              isEvenRow: false,
              isMiddleRow: true,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Totalt tryckfall",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "30 Pa",
                },
              ],
            },
            {
              rowIndex2: true,
              rowFlags: {
                rowIndex2: true,
              },
              isHeader: false,
              isEvenRow: true,
              isMiddleRow: true,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Tilluftstemperatur",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "18.0 °C",
                },
              ],
            },
            {
              rowIndex3: true,
              rowFlags: {
                rowIndex3: true,
              },
              isHeader: false,
              isEvenRow: false,
              isMiddleRow: false,
              isLastRow: true,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Rumstemperatur",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "24.0 °C",
                },
              ],
            },
          ],
        },
      },
      {
        visualizerFlags: {
          tech_ordering_code: true,
        },
        tech_ordering_code: true,
        text: "DCR-125-TK-125-100",
      },
      {
        visualizerFlags: {
          accessories: true,
        },
        accessories: true,
        table: {
          name: "accessories",
          tableFlags: {
            nbrRows2: true,
            nbrColumns3: true,
          },
          nbrRows2: true,
          nbrColumns3: true,
          rows: [
            {
              rowIndex0: true,
              rowFlags: {
                rowIndex0: true,
              },
              isHeader: false,
              isEvenRow: true,
              isMiddleRow: false,
              isLastRow: false,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Anslutningslåda",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "TK-125-100",
                },
                {
                  cellFlags: {
                    cellIndex2: true,
                  },
                  cellIndex2: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "",
                },
              ],
            },
            {
              rowIndex1: true,
              rowFlags: {
                rowIndex1: true,
              },
              isHeader: false,
              isEvenRow: false,
              isMiddleRow: false,
              isLastRow: true,
              cells: [
                {
                  cellFlags: {
                    cellIndex0: true,
                  },
                  cellIndex0: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Muff/Nippel",
                },
                {
                  cellFlags: {
                    cellIndex1: true,
                  },
                  cellIndex1: true,
                  isEvenCell: false,
                  isMiddleCell: true,
                  isLastCell: false,
                  colSpan: 1,
                  text: "Nej",
                },
                {
                  cellFlags: {
                    cellIndex2: true,
                  },
                  cellIndex2: true,
                  isEvenCell: true,
                  isMiddleCell: false,
                  isLastCell: true,
                  colSpan: 1,
                  text: "",
                },
              ],
            },
          ],
        },
      },
      {
        visualizerFlags: {
          short_key: true,
        },
        short_key: true,
        text: "DCR-125 + TK-125-100",
      },
    ],
  },
  node: {
    report: {
      market: {
        propertyName: "market",
        name: "market",
        long: "market",
        value: "kb",
        values: [],
        propertyValue: 1,
        unit: "",
      },
      product: {
        propertyName: "product",
        name: "product",
        long: "product",
        propertyValue: "DCR",
        value: "DCR",
        values: [],
        unit: "",
      },
      techdata: {
        propertyName: "techdata",
        name: "Teknisk data",
        long: "techdata",
        value: "",
        values: [],
        propertyValue: 1,
        unit: "",
      },
      producttype: {
        propertyName: "producttype",
        name: "producttype",
        long: "producttype",
        value: "supply",
        values: [],
        propertyValue: 1,
        unit: "",
      },
      date_time: {
        propertyName: "date_time",
        name: "Inkludera datum i filnamnet",
        long: "date_time",
        value: "",
        values: [],
        propertyValue: 0,
        unit: "",
      },
      notes: {
        propertyName: "notes",
        name: "Anteckningar",
        long: "notes",
        propertyValue: "",
        value: "",
        values: [],
        unit: "",
      },
    },
    product: {
      market: {
        propertyName: "market",
        name: "market",
        long: "market",
        value: "sv-SE",
        values: [],
        propertyValue: 1,
        unit: "",
      },
      sleeve_nipple: {
        propertyName: "sleeve_nipple",
        name: "Muff/Nippel",
        long: "sleeve_nipple",
        value: "Nej",
        values: [],
        propertyValue: 0,
        unit: "",
      },
      boxsize: {
        propertyName: "boxsize",
        name: "Ansl.storlek - låda",
        long: "boxsize",
        value: "100",
        values: [],
        propertyValue: 100,
        unit: "",
      },
      box: {
        propertyName: "box",
        name: "Ja",
        long: "box",
        value: "Ja",
        values: [],
        propertyValue: 1,
        unit: "",
      },
      size: {
        propertyName: "size",
        name: "Donstorlek",
        long: "size",
        value: "125",
        values: [],
        propertyValue: 125,
        unit: "",
      },
      way: {
        propertyName: "way",
        name: "Spridningsbild",
        long: "way",
        value: "Rotation",
        values: [],
        propertyValue: 0,
        unit: "",
      },
      producttype: {
        propertyName: "producttype",
        name: "Luftflöde",
        long: "producttype",
        value: "supplyflushmounting",
        values: [],
        propertyValue: 14,
        unit: "",
      },
      roompropertiesCEILING: {
        propertyName: "roompropertiesCEILING",
        name: "Beräkna rumsegenskaper",
        long: "Beräkna rumsdämpning (default 4dB) genom att bestämma rumstyp och rummets storlek.  \n\n\n",
        value: "No",
        values: [],
        propertyValue: 0,
        unit: "",
      },
      case_flow: {
        propertyName: "case_flow",
        name: "Luftflöde",
        long: "",
        propertyValue: 15,
        value: "15",
        values: [],
        unit: "l/s",
      },
      case_pressure: {
        propertyName: "case_pressure",
        name: "Totalt tryckfall",
        long: "",
        propertyValue: 30,
        value: "30",
        values: [],
        unit: "Pa",
      },
      case_producttype: {
        propertyName: "case_producttype",
        name: "{DCR.producttype}",
        long: "",
        value: "14",
        values: [],
        propertyValue: 14,
        unit: "",
      },
      case_market: {
        propertyName: "case_market",
        name: "{DCR.market}",
        long: "",
        value: "1",
        values: [],
        propertyValue: 1,
        unit: "",
      },
      case_reduction: {
        propertyName: "case_reduction",
        name: "{DCR.reduction}",
        long: "",
        value: "1",
        values: [],
        propertyValue: 1,
        unit: "",
      },
      case_box: {
        propertyName: "case_box",
        name: "Anslutningslåda",
        long: "",
        value: "0",
        values: [],
        propertyValue: 0,
        unit: "",
      },
      case_minairflowSE: {
        propertyName: "case_minairflowSE",
        name: "{DCR.minairflowSE}",
        long: "",
        propertyValue: 0,
        value: "0",
        values: [],
        unit: "l/s",
      },
      case_maxairflowSE: {
        propertyName: "case_maxairflowSE",
        name: "{DCR.maxairflowSE}",
        long: "",
        propertyValue: 0,
        value: "0",
        values: [],
        unit: "l/s",
      },
      case_minairflowM3H: {
        propertyName: "case_minairflowM3H",
        name: "{DCR.minairflowM3H}",
        long: "",
        propertyValue: 0,
        value: "0",
        values: [],
        unit: "l/s",
      },
      case_maxairflowM3H: {
        propertyName: "case_maxairflowM3H",
        name: "{DCR.maxairflowM3H}",
        long: "",
        propertyValue: 0,
        value: "0",
        values: [],
        unit: "l/s",
      },
      case_supplytemp: {
        propertyName: "case_supplytemp",
        name: "{DCR.supplytemp}",
        long: "",
        propertyValue: 18,
        value: "18.0",
        values: [],
        unit: "°C",
      },
      case_roomtemp: {
        propertyName: "case_roomtemp",
        name: "{DCR.roomtemp}",
        long: "",
        propertyValue: 24,
        value: "24.0",
        values: [],
        unit: "°C",
      },
      case_PrimaryAirPressureIN: {
        propertyName: "case_PrimaryAirPressureIN",
        name: "{DCR.PrimaryAirPressureIN}",
        long: "",
        propertyValue: 50,
        value: "50",
        values: [],
        unit: "Pa",
      },
      case_PrimaryAirFlowIN: {
        propertyName: "case_PrimaryAirFlowIN",
        name: "{DCR.PrimaryAirFlowIN}",
        long: "",
        propertyValue: 50,
        value: "50",
        values: [],
        unit: "l/s",
      },
      case_RoomTempIN: {
        propertyName: "case_RoomTempIN",
        name: "{DCR.RoomTempIN}",
        long: "",
        propertyValue: 24,
        value: "24.0",
        values: [],
        unit: "°C",
      },
      case_TempGradientIN: {
        propertyName: "case_TempGradientIN",
        name: "{DCR.TempGradientIN}",
        long: "",
        propertyValue: 0,
        value: "0.0",
        values: [],
        unit: "°C",
      },
      case_PrimaryAirTempIN: {
        propertyName: "case_PrimaryAirTempIN",
        name: "{DCR.PrimaryAirTempIN}",
        long: "",
        propertyValue: 20,
        value: "20.0",
        values: [],
        unit: "°C",
      },
      case_WInletTempIN: {
        propertyName: "case_WInletTempIN",
        name: "{DCR.WInletTempIN}",
        long: "",
        propertyValue: 14,
        value: "14.0",
        values: [],
        unit: "°C",
      },
      case_WOutletTempIN: {
        propertyName: "case_WOutletTempIN",
        name: "{DCR.WOutletTempIN}",
        long: "",
        propertyValue: 17,
        value: "17.0",
        values: [],
        unit: "°C",
      },
      case_roomproperties: {
        propertyName: "case_roomproperties",
        name: "{DCR.roomproperties}",
        long: "",
        value: "0",
        values: [],
        propertyValue: 0,
        unit: "",
      },
      case_roompropertiesCEILING: {
        propertyName: "case_roompropertiesCEILING",
        name: "{DCR.roompropertiesCEILING}",
        long: "",
        value: "0",
        values: [],
        propertyValue: 0,
        unit: "",
      },
      case_roomattenuationtype: {
        propertyName: "case_roomattenuationtype",
        name: "{DCR.roomattenuationtype}",
        long: "",
        value: "3",
        values: [],
        propertyValue: 3,
        unit: "",
      },
      case_roomwidth: {
        propertyName: "case_roomwidth",
        name: "{DCR.roomwidth}",
        long: "",
        propertyValue: 3,
        value: "3.0",
        values: [],
        unit: "m",
      },
      case_roompropertiesWALL: {
        propertyName: "case_roompropertiesWALL",
        name: "{DCR.roompropertiesWALL}",
        long: "",
        value: "0",
        values: [],
        propertyValue: 0,
        unit: "",
      },
      case_roomlength: {
        propertyName: "case_roomlength",
        name: "{DCR.roomlength}",
        long: "",
        propertyValue: 4.5,
        value: "4.5",
        values: [],
        unit: "m",
      },
      case_roomheight: {
        propertyName: "case_roomheight",
        name: "Takhöjd",
        long: "",
        propertyValue: 2.7,
        value: "2.7",
        values: [],
        unit: "m",
      },
      case_mountingheight: {
        propertyName: "case_mountingheight",
        name: "Montagehöjd",
        long: "",
        propertyValue: 2.7,
        value: "2.7",
        values: [],
        unit: "m",
      },
      case_mountingheightwall: {
        propertyName: "case_mountingheightwall",
        name: "{DCR.mountingheightwall}",
        long: "",
        propertyValue: 2.5,
        value: "2.5",
        values: [],
        unit: "m",
      },
      case_multiplesourcesroom: {
        propertyName: "case_multiplesourcesroom",
        name: "{DCR.multiplesourcesroom}",
        long: "",
        value: "0",
        values: [],
        propertyValue: 0,
        unit: "",
      },
      case_multiplesourcesroomCEILING: {
        propertyName: "case_multiplesourcesroomCEILING",
        name: "{DCR.multiplesourcesroomCEILING}",
        long: "",
        value: "0",
        values: [],
        propertyValue: 0,
        unit: "",
      },
      case_multiplesourcesroomWALL: {
        propertyName: "case_multiplesourcesroomWALL",
        name: "{DCR.multiplesourcesroomWALL}",
        long: "",
        value: "0",
        values: [],
        propertyValue: 0,
        unit: "",
      },
      case_numberofsourcesroom: {
        propertyName: "case_numberofsourcesroom",
        name: "{DCR.numberofsourcesroom}",
        long: "",
        value: "1",
        values: [],
        propertyValue: 1,
        unit: "",
      },
      case_numberofsourcesroomCEILING: {
        propertyName: "case_numberofsourcesroomCEILING",
        name: "{DCR.numberofsourcesroomCEILING}",
        long: "",
        value: "1",
        values: [],
        propertyValue: 1,
        unit: "",
      },
      case_numberofsourcesroomWALL: {
        propertyName: "case_numberofsourcesroomWALL",
        name: "{DCR.numberofsourcesroomWALL}",
        long: "",
        value: "1",
        values: [],
        propertyValue: 1,
        unit: "",
      },
      case_walltype: {
        propertyName: "case_walltype",
        name: "{DCR.walltype}",
        long: "",
        value: "1",
        values: [],
        propertyValue: 1,
        unit: "",
      },
      case_transmissionarea: {
        propertyName: "case_transmissionarea",
        name: "{DCR.transmissionarea}",
        long: "",
        value: "10",
        values: [],
        propertyValue: 10,
        unit: "",
      },
      case_roomcalc: {
        propertyName: "case_roomcalc",
        name: "{DCR.roomcalc}",
        long: "",
        value: "0",
        values: [],
        propertyValue: 0,
        unit: "",
      },
      case_Lwroom: {
        propertyName: "case_Lwroom",
        name: "{DCR.Lwroom}",
        long: "",
        propertyValue: 60,
        value: "60.0",
        values: [],
        unit: "dB",
      },
      case_wallarea: {
        propertyName: "case_wallarea",
        name: "{DCR.wallarea}",
        long: "",
        propertyValue: 10,
        value: "10.0",
        values: [],
        unit: "m²",
      },
      case_Rwwall: {
        propertyName: "case_Rwwall",
        name: "{DCR.Rwwall}",
        long: "",
        propertyValue: 40,
        value: "40.0",
        values: [],
        unit: "dB",
      },
      case_doorarea: {
        propertyName: "case_doorarea",
        name: "{DCR.doorarea}",
        long: "",
        propertyValue: 1.89,
        value: "1.9",
        values: [],
        unit: "m²",
      },
      case_Rwdoor: {
        propertyName: "case_Rwdoor",
        name: "{DCR.Rwdoor}",
        long: "",
        propertyValue: 26,
        value: "26.0",
        values: [],
        unit: "dB",
      },
      case_windowarea: {
        propertyName: "case_windowarea",
        name: "{DCR.windowarea}",
        long: "",
        propertyValue: 0,
        value: "0.0",
        values: [],
        unit: "m²",
      },
      case_Rwwindow: {
        propertyName: "case_Rwwindow",
        name: "{DCR.Rwwindow}",
        long: "",
        propertyValue: 32,
        value: "32.0",
        values: [],
        unit: "dB",
      },
      case_HeatingSET: {
        propertyName: "case_HeatingSET",
        name: "{DCR.HeatingSET}",
        long: "",
        value: "0",
        values: [],
        propertyValue: 0,
        unit: "",
      },
      case_caseno: {
        propertyName: "case_caseno",
        name: "{DCR.caseno}",
        long: "",
        value: "1",
        values: [],
        propertyValue: 1,
        unit: "",
      },
      case_function: {
        propertyName: "case_function",
        name: "{DCR.function}",
        long: "",
        value: "1",
        values: [],
        propertyValue: 1,
        unit: "",
      },
      case_control: {
        propertyName: "case_control",
        name: "{DCR.control}",
        long: "",
        value: "1",
        values: [],
        propertyValue: 1,
        unit: "",
      },
      case_placement: {
        propertyName: "case_placement",
        name: "{DCR.placement}",
        long: "",
        value: "440",
        values: [],
        propertyValue: 440,
        unit: "",
      },
      case_roomatt: {
        propertyName: "case_roomatt",
        name: "{DCR.roomatt}",
        long: "",
        propertyValue: 4.033350405587438,
        value: "4.0",
        values: [],
        unit: "dB",
      },
      config_shortKey: {
        propertyName: "config_shortKey",
        name: "{DCR.shortKey}",
        long: "",
        propertyValue: "DCR-125",
        value: "DCR-125",
        values: [],
        unit: "",
      },
      config_accessory_code1: {
        propertyName: "config_accessory_code1",
        name: "Anslutningslåda",
        long: "",
        propertyValue: "TK-125-100",
        value: "TK-125-100",
        values: [],
        unit: "",
      },
      config_minflowPressure: {
        propertyName: "config_minflowPressure",
        name: "Minflöde för att erhålla rek. mättryck",
        long: "",
        propertyValue: 14,
        value: "14",
        values: [],
        unit: "l/s",
      },
      config_shortkey_accessorycode1: {
        propertyName: "config_shortkey_accessorycode1",
        name: "{DCR.shortkey_accessorycode1}",
        long: "",
        propertyValue: "DCR-125 + TK-125-100",
        value: "DCR-125 + TK-125-100",
        values: [],
        unit: "",
      },
      config_ductVelocity: {
        propertyName: "config_ductVelocity",
        name: "Hastighet i kanal",
        long: "",
        propertyValue: 1.909915645392328,
        value: "1.9",
        values: [],
        unit: "m/s",
      },
      config_diffuserDistance: {
        propertyName: "config_diffuserDistance",
        name: "Min. avstånd mellan produkter",
        long: "",
        propertyValue: 826.5211630123928,
        value: "0.8",
        values: [],
        unit: "m",
      },
      config_wallDistance: {
        propertyName: "config_wallDistance",
        name: "Min. avstånd till vägg",
        long: "",
        propertyValue: 413.2605815061964,
        value: "0.4",
        values: [],
        unit: "m",
      },
      design_success: {
        propertyName: "design_success",
        name: "{DCR.success}",
        long: "",
        value: "1",
        values: [],
        propertyValue: 1,
        unit: "",
      },
      design_orderingCode: {
        propertyName: "design_orderingCode",
        name: "Beställningskod",
        long: "",
        propertyValue: "DCR-125-TK-125-100",
        value: "DCR-125-TK-125-100",
        values: [],
        unit: "",
      },
      design_damperType: {
        propertyName: "design_damperType",
        name: "{DCR.damperType}",
        long: "",
        propertyValue: "Continous",
        value: "Continous",
        values: [],
        unit: "",
      },
      design_pressureCurves: {
        propertyName: "design_pressureCurves",
        name: "{DCR.pressureCurves}",
        long: "",
        propertyValue:
          '[{"damper":0,"flowToPressureCurve":{"type":"Power","a":0.18117902635826666,"b":2,"minX":0,"maxX":0}},{"damper":100,"flowToPressureCurve":{"type":"Power","a":0.03711288278927767,"b":2,"minX":0,"maxX":0}}]',
        value:
          '[{"damper":0,"flowToPressureCurve":{"type":"Power","a":0.18117902635826666,"b":2,"minX":0,"maxX":0}},{"damper":100,"flowToPressureCurve":{"type":"Power","a":0.03711288278927767,"b":2,"minX":0,"maxX":0}}]',
        values: [],
        unit: "",
      },
      design_soundCurves: {
        propertyName: "design_soundCurves",
        name: "{DCR.soundCurves}",
        long: "",
        propertyValue:
          '[{"flowToPressure":{"type":"Power","a":0.18066618737360965,"b":2.000825738212635,"minX":0,"maxX":0},"flowToLwA":{"type":"Log","a":54.33931417617247,"b":-42.19086335884424,"minX":16.6,"maxX":38.7}},{"flowToPressure":{"type":"Power","a":0.08896533459586921,"b":1.999420357995356,"minX":0,"maxX":0},"flowToLwA":{"type":"Log","a":57.33826362911434,"b":-49.343255562888835,"minX":19.1,"maxX":42.6}},{"flowToPressure":{"type":"Power","a":0.037447655634319565,"b":1.9976354276335881,"minX":0,"maxX":0},"flowToLwA":{"type":"Log","a":65.24255157954093,"b":-67.32197369948304,"minX":25.2,"maxX":51}}]',
        value:
          '[{"flowToPressure":{"type":"Power","a":0.18066618737360965,"b":2.000825738212635,"minX":0,"maxX":0},"flowToLwA":{"type":"Log","a":54.33931417617247,"b":-42.19086335884424,"minX":16.6,"maxX":38.7}},{"flowToPressure":{"type":"Power","a":0.08896533459586921,"b":1.999420357995356,"minX":0,"maxX":0},"flowToLwA":{"type":"Log","a":57.33826362911434,"b":-49.343255562888835,"minX":19.1,"maxX":42.6}},{"flowToPressure":{"type":"Power","a":0.037447655634319565,"b":1.9976354276335881,"minX":0,"maxX":0},"flowToLwA":{"type":"Log","a":65.24255157954093,"b":-67.32197369948304,"minX":25.2,"maxX":51}}]',
        values: [],
        unit: "",
      },
      design_soundLines: {
        propertyName: "design_soundLines",
        name: "{DCR.soundLines}",
        long: "",
        propertyValue: "[25,30,35,40]",
        value: "[25,30,35,40]",
        values: ["25"],
        unit: "",
      },
      design_throwPoints: {
        propertyName: "design_throwPoints",
        name: "{DCR.throwPoints}",
        long: "",
        propertyValue:
          '[{"flow":10,"throwLength":0.40444444444444444},{"flow":11.2,"throwLength":0.4529777777777778},{"flow":12.4,"throwLength":0.5015111111111111},{"flow":13.6,"throwLength":0.5500444444444444},{"flow":14.8,"throwLength":0.5985777777777779},{"flow":16,"throwLength":0.6471111111111111},{"flow":17.2,"throwLength":0.6956444444444444},{"flow":18.4,"throwLength":0.7441777777777777},{"flow":19.6,"throwLength":0.7927111111111113},{"flow":20.799999999999997,"throwLength":0.8412444444444444},{"flow":22,"throwLength":0.8897777777777778},{"flow":23.2,"throwLength":0.938311111111111},{"flow":24.4,"throwLength":0.9868444444444445},{"flow":25.6,"throwLength":1.035377777777778},{"flow":26.8,"throwLength":1.0839111111111113},{"flow":28,"throwLength":1.1324444444444444},{"flow":29.2,"throwLength":1.1809777777777777},{"flow":30.400000000000002,"throwLength":1.2295111111111112},{"flow":31.599999999999998,"throwLength":1.2780444444444445},{"flow":32.8,"throwLength":1.3265777777777776},{"flow":34,"throwLength":1.3751111111111112},{"flow":35.2,"throwLength":1.4236444444444447},{"flow":36.4,"throwLength":1.4721777777777778},{"flow":37.6,"throwLength":1.5207111111111111},{"flow":38.8,"throwLength":1.5692444444444444},{"flow":40,"throwLength":1.6177777777777778},{"flow":41.2,"throwLength":1.6663111111111113},{"flow":42.400000000000006,"throwLength":1.7148444444444446},{"flow":43.6,"throwLength":1.763377777777778},{"flow":44.8,"throwLength":1.8119111111111112},{"flow":46,"throwLength":1.8604444444444443},{"flow":47.2,"throwLength":1.908977777777778},{"flow":48.4,"throwLength":1.957511111111111},{"flow":49.6,"throwLength":2.0060444444444445},{"flow":50.800000000000004,"throwLength":2.0545777777777783},{"flow":52,"throwLength":2.103111111111111},{"flow":53.199999999999996,"throwLength":2.1516444444444445},{"flow":54.4,"throwLength":2.200177777777778},{"flow":55.6,"throwLength":2.248711111111111},{"flow":56.800000000000004,"throwLength":2.2972444444444444},{"flow":58,"throwLength":2.3457777777777777},{"flow":59.199999999999996,"throwLength":2.394311111111111},{"flow":60.4,"throwLength":2.4428444444444444},{"flow":61.6,"throwLength":2.491377777777778},{"flow":62.8,"throwLength":2.539911111111111},{"flow":64,"throwLength":2.5884444444444443},{"flow":65.2,"throwLength":2.636977777777778},{"flow":66.4,"throwLength":2.6855111111111114},{"flow":67.6,"throwLength":2.7340444444444443},{"flow":68.8,"throwLength":2.7825777777777776},{"flow":70,"throwLength":2.8311111111111114}]',
        value:
          '[{"flow":10,"throwLength":0.40444444444444444},{"flow":11.2,"throwLength":0.4529777777777778},{"flow":12.4,"throwLength":0.5015111111111111},{"flow":13.6,"throwLength":0.5500444444444444},{"flow":14.8,"throwLength":0.5985777777777779},{"flow":16,"throwLength":0.6471111111111111},{"flow":17.2,"throwLength":0.6956444444444444},{"flow":18.4,"throwLength":0.7441777777777777},{"flow":19.6,"throwLength":0.7927111111111113},{"flow":20.799999999999997,"throwLength":0.8412444444444444},{"flow":22,"throwLength":0.8897777777777778},{"flow":23.2,"throwLength":0.938311111111111},{"flow":24.4,"throwLength":0.9868444444444445},{"flow":25.6,"throwLength":1.035377777777778},{"flow":26.8,"throwLength":1.0839111111111113},{"flow":28,"throwLength":1.1324444444444444},{"flow":29.2,"throwLength":1.1809777777777777},{"flow":30.400000000000002,"throwLength":1.2295111111111112},{"flow":31.599999999999998,"throwLength":1.2780444444444445},{"flow":32.8,"throwLength":1.3265777777777776},{"flow":34,"throwLength":1.3751111111111112},{"flow":35.2,"throwLength":1.4236444444444447},{"flow":36.4,"throwLength":1.4721777777777778},{"flow":37.6,"throwLength":1.5207111111111111},{"flow":38.8,"throwLength":1.5692444444444444},{"flow":40,"throwLength":1.6177777777777778},{"flow":41.2,"throwLength":1.6663111111111113},{"flow":42.400000000000006,"throwLength":1.7148444444444446},{"flow":43.6,"throwLength":1.763377777777778},{"flow":44.8,"throwLength":1.8119111111111112},{"flow":46,"throwLength":1.8604444444444443},{"flow":47.2,"throwLength":1.908977777777778},{"flow":48.4,"throwLength":1.957511111111111},{"flow":49.6,"throwLength":2.0060444444444445},{"flow":50.800000000000004,"throwLength":2.0545777777777783},{"flow":52,"throwLength":2.103111111111111},{"flow":53.199999999999996,"throwLength":2.1516444444444445},{"flow":54.4,"throwLength":2.200177777777778},{"flow":55.6,"throwLength":2.248711111111111},{"flow":56.800000000000004,"throwLength":2.2972444444444444},{"flow":58,"throwLength":2.3457777777777777},{"flow":59.199999999999996,"throwLength":2.394311111111111},{"flow":60.4,"throwLength":2.4428444444444444},{"flow":61.6,"throwLength":2.491377777777778},{"flow":62.8,"throwLength":2.539911111111111},{"flow":64,"throwLength":2.5884444444444443},{"flow":65.2,"throwLength":2.636977777777778},{"flow":66.4,"throwLength":2.6855111111111114},{"flow":67.6,"throwLength":2.7340444444444443},{"flow":68.8,"throwLength":2.7825777777777776},{"flow":70,"throwLength":2.8311111111111114}]',
        values: [],
        unit: "",
      },
      design_soundPoints: {
        propertyName: "design_soundPoints",
        name: "{DCR.soundPoints}",
        long: "",
        propertyValue:
          '[{"sortNo":0,"flow":16.6,"pressure":49.9,"soundLwA":24.108973366053416,"soundLpA":20.108973366053416},{"sortNo":1,"flow":38.7,"pressure":271.4,"soundLwA":44.08426159027236,"soundLpA":40.08426159027236},{"sortNo":2,"flow":19.1,"pressure":32.4,"soundLwA":24.108973366053416,"soundLpA":20.108973366053416},{"sortNo":3,"flow":42.6,"pressure":161.1,"soundLwA":44.08426159027236,"soundLpA":40.08426159027236},{"sortNo":4,"flow":25.2,"pressure":23.6,"soundLwA":24.108973366053416,"soundLpA":20.108973366053416},{"sortNo":5,"flow":51,"pressure":96.5,"soundLwA":44.08426159027236,"soundLpA":40.08426159027236}]',
        value:
          '[{"sortNo":0,"flow":16.6,"pressure":49.9,"soundLwA":24.108973366053416,"soundLpA":20.108973366053416},{"sortNo":1,"flow":38.7,"pressure":271.4,"soundLwA":44.08426159027236,"soundLpA":40.08426159027236},{"sortNo":2,"flow":19.1,"pressure":32.4,"soundLwA":24.108973366053416,"soundLpA":20.108973366053416},{"sortNo":3,"flow":42.6,"pressure":161.1,"soundLwA":44.08426159027236,"soundLpA":40.08426159027236},{"sortNo":4,"flow":25.2,"pressure":23.6,"soundLwA":24.108973366053416,"soundLpA":20.108973366053416},{"sortNo":5,"flow":51,"pressure":96.5,"soundLwA":44.08426159027236,"soundLpA":40.08426159027236}]',
        values: [],
        unit: "",
      },
      design_minFlow: {
        propertyName: "design_minFlow",
        name: "Valt flöde är lägre än spjällets min. flöde  ",
        long: "",
        propertyValue: 10,
        value: "10",
        values: [],
        unit: "l/s",
      },
      design_maxFlow: {
        propertyName: "design_maxFlow",
        name: "{DCR.maxFlow}",
        long: "",
        propertyValue: 70,
        value: "70",
        values: [],
        unit: "l/s",
      },
      design_minPressure: {
        propertyName: "design_minPressure",
        name: "{DCR.minPressure}",
        long: "",
        propertyValue: 10,
        value: "10",
        values: [],
        unit: "Pa",
      },
      design_maxPressure: {
        propertyName: "design_maxPressure",
        name: "{DCR.maxPressure}",
        long: "",
        propertyValue: 300,
        value: "300",
        values: [],
        unit: "Pa",
      },
      design_minRecFlow: {
        propertyName: "design_minRecFlow",
        name: "{DCR.minRecFlow}",
        long: "",
        propertyValue: 10,
        value: "10",
        values: [],
        unit: "l/s",
      },
      design_maxRecFlow: {
        propertyName: "design_maxRecFlow",
        name: "{DCR.maxRecFlow}",
        long: "",
        propertyValue: 70,
        value: "70",
        values: [],
        unit: "l/s",
      },
      design_minRecPressure: {
        propertyName: "design_minRecPressure",
        name: "{DCR.minRecPressure}",
        long: "",
        propertyValue: 10,
        value: "10",
        values: [],
        unit: "Pa",
      },
      design_maxRecPressure: {
        propertyName: "design_maxRecPressure",
        name: "{DCR.maxRecPressure}",
        long: "",
        propertyValue: 300,
        value: "300",
        values: [],
        unit: "Pa",
      },
      design_damperMid: {
        propertyName: "design_damperMid",
        name: "{DCR.damperMid}",
        long: "",
        propertyValue: 50,
        value: "50.0",
        values: [],
        unit: "%",
      },
      design_flow: {
        propertyName: "design_flow",
        name: "Luftflöde",
        long: "",
        propertyValue: 15,
        value: "15",
        values: [],
        unit: "l/s",
      },
      design_pressure: {
        propertyName: "design_pressure",
        name: "Totalt tryckfall",
        long: "",
        propertyValue: 30,
        value: "30",
        values: [],
        unit: "Pa",
      },
      design_soundLwA: {
        propertyName: "design_soundLwA",
        name: "Ljudeffekt (LwA)",
        long: "",
        propertyValue: 20.390625,
        value: "20",
        values: [],
        unit: "dB(A)",
      },
      design_soundLpA: {
        propertyName: "design_soundLpA",
        name: "Ljudtryck (LpA)",
        long: "",
        propertyValue: 16.357274594412562,
        value: "16",
        values: [],
        unit: "dB(A)",
      },
      design_soundLwABands: {
        propertyName: "design_soundLwABands",
        name: "Ljudeffekt (LwA)",
        long: "",
        propertyValue:
          "[21.357274594412562;22.357274594412562;22.357274594412562;21.357274594412562;11.357274594412562;3.357274594412562;0;0]",
        value:
          "[21.357274594412562;22.357274594412562;22.357274594412562;21.357274594412562;11.357274594412562;3.357274594412562;0;0]",
        values: ["21", "22", "22", "21", "11", "3", "0", "0"],
        unit: "",
      },
      design_soundAttenuation: {
        propertyName: "design_soundAttenuation",
        name: "Ljuddämpning",
        long: "",
        propertyValue: "[19;17;16;14;27;25;23;23]",
        value: "[19;17;16;14;27;25;23;23]",
        values: ["19", "17", "16", "14", "27", "25", "23", "23"],
        unit: "",
      },
      design_damper: {
        propertyName: "design_damper",
        name: "Spjällets öppning",
        long: "",
        propertyValue: 19.33959160999649,
        value: "19.3",
        values: [],
        unit: "%",
      },
      design_damperDegrees: {
        propertyName: "design_damperDegrees",
        name: "Spjäll",
        long: "",
        propertyValue: 19.33959160999649,
        value: "19",
        values: [],
        unit: "°",
      },
      design_damperPercent: {
        propertyName: "design_damperPercent",
        name: "Spjäll",
        long: "",
        propertyValue: 19.33959160999649,
        value: "19.3",
        values: [],
        unit: "%",
      },
      design_damperOne: {
        propertyName: "design_damperOne",
        name: "Spjäll",
        long: "",
        propertyValue: 19.33959160999649,
        value: "19",
        values: [],
        unit: " ",
      },
      design_damperMillimeter: {
        propertyName: "design_damperMillimeter",
        name: "Spjäll",
        long: "",
        propertyValue: 19.33959160999649,
        value: "19",
        values: [],
        unit: "mm",
      },
      design_supplyTemp: {
        propertyName: "design_supplyTemp",
        name: "Tilluftstemperatur",
        long: "",
        propertyValue: 18,
        value: "18.0",
        values: [],
        unit: "°C",
      },
      design_roomTemp: {
        propertyName: "design_roomTemp",
        name: "Rumstemperatur",
        long: "",
        propertyValue: 24,
        value: "24.0",
        values: [],
        unit: "°C",
      },
      design_roomAtt: {
        propertyName: "design_roomAtt",
        name: "Rumsdämpning",
        long: "",
        propertyValue: 4.033350405587438,
        value: "4",
        values: [],
        unit: "dB",
      },
      design_coolingEffect: {
        propertyName: "design_coolingEffect",
        name: "Kyleffekt",
        long: "",
        propertyValue: 0.10854,
        value: "109",
        values: [],
        unit: "W",
      },
      design_minFlowAtPressure: {
        propertyName: "design_minFlowAtPressure",
        name: "Min flöde vid tryckfall",
        long: "",
        propertyValue: 12.867870056734915,
        value: "13",
        values: [],
        unit: "l/s",
      },
      design_maxFlowAtPressure: {
        propertyName: "design_maxFlowAtPressure",
        name: "Max flöde vid tryckfall",
        long: "",
        propertyValue: 28.431402415224024,
        value: "28",
        values: [],
        unit: "l/s",
      },
      design_throwLength: {
        propertyName: "design_throwLength",
        name: "Kastlängd (L0,2)",
        long: "",
        propertyValue: 0.6066666666666667,
        value: "0.6",
        values: [],
        unit: "m",
      },
    },
  },
  accessories: {
    available: [],
  },
};

const partialsTest = {
  "common-page":
    '<page>\r\n    <style orientation="Portrait" paperSize="A4" noTopBottomMargin="false">\r\n        <headerMargins top="5" bottom="0" left="45" right="45"/>\r\n        <contentMargins top="5" bottom="5" left="45" right="45"/>\r\n        <footerMargins top="5" bottom="5" left="45" right="45"/>\r\n    </style>\r\n    <header>\r\n        <Table columnWidths="inf">\r\n            <TableRow>\r\n                <TableCell styleName="headerCell">\r\n                    <Table columnWidths="inf,inf">\r\n                        <TableRow>\r\n                            <ImageCell src="{{#images.report}}{{#imageFlags.name_kb}}{{url}}{{/imageFlags.name_kb}}{{/images.report}}" width="170" height="140">\r\n                                <paragraphStyle margins="0 0 0 0" alignment="Start"/>\r\n                            </ImageCell>\r\n                            <TextCell text="{{texts.product.shortname}}" styleNames="headerProductTextRight"/>\r\n                        </TableRow>\r\n                    </Table>\r\n                </TableCell>\r\n            </TableRow>\r\n        </Table>\r\n    </header>\r\n    <footer>\r\n        <Table columnWidths="inf">\r\n            <TableRow>\r\n                <TableCell styleName="footerCell">\r\n                    <Table columnWidths="inf,inf,inf">\r\n                        <TableRow>\r\n                            <TextCell text="{{common.date}}" styleNames="footerDateText">\r\n                                <style verticalAlignment="Middle"/>\r\n                            </TextCell>\r\n                            <TableCell>\r\n                                <style verticalAlignment="Top"/>\r\n                                <Table columnWidths="inf">\r\n                                    <TextRow text="{{texts.report.reservation}}" styleNames="footerInfoTextTop"/>\r\n                                    <TextRow text="{{texts.report.kb_link}}" styleNames="footerInfoTextBottom"/>\r\n                                    <!-- <TextRow text="Klimatbyrån AB förbehåller sig rätten till ändringar." styleNames="footerInfoTextTop"/> -->\r\n                                    <!-- <TextRow text="www.klimatbyran.se" styleNames="footerInfoTextBottom"/> -->\r\n                                </Table>\r\n                            </TableCell>\r\n                            <TableCell>\r\n                                <style verticalAlignment="Middle"/>\r\n                                <Paragraph>\r\n                                    <style margins="0 0 0 0" alignment="End"/>\r\n                                    <!-- <TextField fieldType="PageNumber" styleName="footerPageText"/>\r\n                                    <TextRun text="/" styleName="footerDataPageText"/>\r\n                                    <TextField fieldType="TotalPages" styleName="footerPageText"/> -->\r\n                                </Paragraph>\r\n                            </TableCell>\r\n                        </TableRow>\r\n                    </Table>\r\n                </TableCell>\r\n            </TableRow>\r\n        </Table>\r\n    </footer>\r\n</page>',
  styles:
    '    <StyleName type="ParagraphStyle" name="titleParagraph" margins="0 0 7 0" />\r\n\r\n    <StyleName type="ParagraphStyle" name="H5" margins="0 0 20 0" />\r\n    <StyleName type="TextStyle" name="H1" color="#1d5da1" bold="true" fontSize="14"  />\r\n    <StyleName type="TextStyle" name="H2" color="#1d5da1" bold="true" italic="true" fontSize="14"  />\r\n    <StyleName type="TextStyle" name="H3" color="#1d5da1" bold="true" fontSize="12"  />\r\n    <StyleName type="TextStyle" name="H4" color="#1d5da1" bold="true" italic="true" fontSize="12"  />\r\n    <StyleName type="TextStyle" name="H5" color="#1d5da1" bold="true" fontSize="10"  />\r\n\r\n    <StyleName type="TextStyle" name="titleText" color="#1d5da1" bold="true" fontSize="12"  />\r\n    <StyleName type="TextStyle" name="headerText" fontSize="12" color="#ffffff" bold="true" alignment="left"  />\r\n    <StyleName type="TableCellStyle" name="tableProductName" verticalAlignment="Top" background="#ffffff" padding="10 1 1 10" />\r\n    <!-- <StyleName type="TableCellStyle" name="tableProductName" verticalAlignment="Top" background="#d2d3d5" padding="10 1 1 10"/> -->\r\n    <StyleName type="TableCellStyle" name="tableProductImage" background="#ffffff" padding="0 0 0 0" />\r\n    <StyleName type="TextStyle" name="textProductDescription" verticalAlignment="Top" fontSize="12" color="#1d5da1" />\r\n    <!-- <StyleName type="TextStyle" name="textProductDescription" verticalAlignment="Top" fontSize="16" color="ffffff" fontFamily="Helvetica"/> -->\r\n    <StyleName type="TextStyle" name="textProductName" verticalAlignment="Top" fontSize="26" color="#1d5da1" />\r\n    <!-- <StyleName type="TextStyle" name="textProductName" verticalAlignment="Top" fontSize="26" color="#ffffff" fontFamily="Helvetica"/> -->\r\n    <StyleName type="TextStyle" name="textProductCode" verticalAlignment="Top" fontSize="16" color="#1d5da1" />\r\n    <!-- <StyleName type="TextStyle" name="textProductName" verticalAlignment="Top" fontSize="26" color="#ffffff" fontFamily="Helvetica"/> -->\r\n    <StyleName type="TableCellStyle" name="CellOrdering" background="#ffffff" padding="15 0 0 0"  />\r\n        <StyleName type="TableCellStyle" name="evenCell" background="#ffffff" padding="0 0 0 0"  />\r\n    <StyleName type="TableCellStyle" name="oddCell" background="#ffffff" padding="0 0 0 0"  />\r\n        <StyleName type="TableCellStyle" name="headerBoldTextPadding" background="#ffffff" padding="0 0 2 0"  />\r\n    <StyleName type="TableCellStyle" name="topBottomPaddingCell" background="#ffffff" padding="2 0 2 0"  />\r\n    <StyleName type="TextStyle" name="tableColumnHeader" fontSize="12" alignment="left" bold="false" color="#1d5da1" />\r\n    <StyleName type="TextStyle" name="textLeft" fontSize="9" alignment="left" />\r\n    <StyleName type="TextStyle" name="textMiddle" fontSize="9" alignment="center" />\r\n    <StyleName type="TextStyle" name="textRight" fontSize="9" alignment="right" />\r\n    <StyleName type="TextStyle" name="footerInfoTextTop" fontSize="7" color="#9D9FA2" alignment="center" />\r\n    <StyleName type="TextStyle" name="footerInfoTextBottom" fontSize="11" color="#9D9FA2" alignment="center" />\r\n    <StyleName type="TextStyle" name="footerDateText" fontSize="11" color="#9D9FA2" alignment="start"  />\r\n    <StyleName type="TextStyle" name="footerPageText" fontSize="11" color="#9D9FA2" alignment="end"  />\r\n    <StyleName type="TextStyle" name="headerTitleText" fontSize="9" color="#2b2d30" bold="true"  />\r\n    <StyleName type="TextStyle" name="headerText" fontSize="9" background="#dfe9ed" color="#2b2d30" />\r\n    <StyleName type="TextStyle" name="headerBoldText" fontSize="9" bold="true" margins="0 0 2 0" background="#dfe9ed" color="#1d5da1" />\r\n    <StyleName type="TextStyle" name="headerProductTextRight" fontSize="26" color="#1d5da1" alignment="right" />\r\n    <StyleName type="TableCellStyle" name="headerCell" borderColor="#004F8F" padding="0 0 15 0" borders="0 0 2 0" />\r\n    <StyleName type="TableCellStyle" name="footerCell" borderColor="#004F8F" padding="8 0 0 0" borders="2 0 0 0" />\r\n    <StyleName type="TableCellStyle" name="alignTop" verticalAlignment="Top"/>',
  "visualizer-table":
    '{{#table}}\r\n{{#nbrColumns2}}\r\n<Table columnWidths="80,80">\r\n    {{#rows}}\r\n    <TableRow>\r\n        {{#cells}}\r\n        <TextCell text="{{text}}" styleNames="{{#isEvenRow}}evenCell{{/isEvenRow}}{{^isEvenRow}}oddCell{{/isEvenRow}},{{#rowIndex0}}tableColumnHeader{{/rowIndex0}}{{^rowIndex0}}textMiddle{{/rowIndex0}}" columnSpan="{{colSpan}}"/>\r\n        {{/cells}}\r\n    </TableRow>\r\n    {{/rows}}\r\n</Table>\r\n{{/nbrColumns2}}\r\n{{#nbrColumns3}}\r\n<Table columnWidths="140,80,35">\r\n    {{#rows}}\r\n    <TableRow>\r\n        {{#cells}}\r\n        <TextCell text="{{text}}" styleNames="{{#isEvenRow}}evenCell{{/isEvenRow}}{{^isEvenRow}}oddCell{{/isEvenRow}},{{#isMiddleCell}}textRight{{/isMiddleCell}}{{^isMiddleCell}}textLeft{{/isMiddleCell}}" columnSpan="{{colSpan}}"/>\r\n        {{/cells}}\r\n    </TableRow>\r\n    {{/rows}}\r\n</Table>\r\n{{/nbrColumns3}}\r\n{{#nbrColumns4}}\r\n<Table columnWidths="145,80,80,40">\r\n    {{#rows}}\r\n    <TableRow>\r\n        {{#cells}}\r\n        {{#cellIndex2}}<TextCell text="" styleNames="{{#isEvenRow}}evenCell{{/isEvenRow}}{{^isEvenRow}}oddCell{{/isEvenRow}},{{#rowIndex0}}tableColumnHeader{{/rowIndex0}}{{^rowIndex0}}{{#isMiddleCell}}textMiddle{{/isMiddleCell}}{{^isMiddleCell}}textLeft{{/isMiddleCell}}{{/rowIndex0}}" columnSpan="{{colSpan}}"/>{{/cellIndex2}}\r\n        <TextCell text="{{text}}" styleNames="{{#isEvenRow}}evenCell{{/isEvenRow}}{{^isEvenRow}}oddCell{{/isEvenRow}},{{#rowIndex0}}tableColumnHeader{{/rowIndex0}}{{^rowIndex0}}{{#isMiddleCell}}textMiddle{{/isMiddleCell}}{{^isMiddleCell}}textLeft{{/isMiddleCell}}{{/rowIndex0}}" columnSpan="{{colSpan}}"/>\r\n        {{#cellIndex2}}<TextCell text="" styleNames="{{#isEvenRow}}evenCell{{/isEvenRow}}{{^isEvenRow}}oddCell{{/isEvenRow}},{{#rowIndex0}}tableColumnHeader{{/rowIndex0}}{{^rowIndex0}}{{#isMiddleCell}}textMiddle{{/isMiddleCell}}{{^isMiddleCell}}textLeft{{/isMiddleCell}}{{/rowIndex0}}" columnSpan="{{colSpan}}"/>{{/cellIndex2}}\r\n        {{/cells}}\r\n    </TableRow>\r\n    {{/rows}}\r\n</Table>\r\n{{/nbrColumns4}}\r\n{{#nbrColumns5}}\r\n<Table columnWidths="145,80,80,80,40">\r\n    {{#rows}}\r\n    <TableRow>\r\n        {{#cells}}\r\n        {{#cellIndex2}}<TextCell text="" styleNames="{{#isEvenRow}}evenCell{{/isEvenRow}}{{^isEvenRow}}oddCell{{/isEvenRow}},{{#rowIndex0}}tableColumnHeader{{/rowIndex0}}{{^rowIndex0}}{{#isMiddleCell}}textMiddle{{/isMiddleCell}}{{^isMiddleCell}}textLeft{{/isMiddleCell}}{{/rowIndex0}}" columnSpan="{{colSpan}}"/>{{/cellIndex2}}\r\n        <TextCell text="{{text}}" styleNames="{{#isEvenRow}}evenCell{{/isEvenRow}}{{^isEvenRow}}oddCell{{/isEvenRow}},{{#rowIndex0}}tableColumnHeader{{/rowIndex0}}{{^rowIndex0}}{{#isMiddleCell}}textMiddle{{/isMiddleCell}}{{^isMiddleCell}}textLeft{{/isMiddleCell}}{{/rowIndex0}}" columnSpan="{{colSpan}}"/>\r\n        {{#cellIndex2}}<TextCell text="" styleNames="{{#isEvenRow}}evenCell{{/isEvenRow}}{{^isEvenRow}}oddCell{{/isEvenRow}},{{#rowIndex0}}tableColumnHeader{{/rowIndex0}}{{^rowIndex0}}{{#isMiddleCell}}textMiddle{{/isMiddleCell}}{{^isMiddleCell}}textLeft{{/isMiddleCell}}{{/rowIndex0}}" columnSpan="{{colSpan}}"/>{{/cellIndex2}}\r\n        {{/cells}}\r\n    </TableRow>\r\n    {{/rows}}\r\n</Table>\r\n{{/nbrColumns5}}\r\n{{#nbrColumns6}}\r\n<Table columnWidths="145,80,80,80,80,40">\r\n    {{#rows}}\r\n    <TableRow>\r\n        {{#cells}}\r\n        <TextCell text="{{text}}" styleNames="{{#isEvenRow}}evenCell{{/isEvenRow}}{{^isEvenRow}}oddCell{{/isEvenRow}},{{#rowIndex0}}tableColumnHeader{{/rowIndex0}}{{^rowIndex0}}{{#isMiddleCell}}textMiddle{{/isMiddleCell}}{{^isMiddleCell}}textLeft{{/isMiddleCell}}{{/rowIndex0}}" columnSpan="{{colSpan}}"/>\r\n        {{/cells}}\r\n    </TableRow>\r\n    {{/rows}}\r\n</Table>\r\n{{/nbrColumns6}}\r\n{{#nbrColumns7}}\r\n<Table columnWidths="145,80,80,80,80,80,40">\r\n    {{#rows}}\r\n    <TableRow>\r\n        {{#cells}}\r\n        <TextCell text="{{text}}" styleNames="{{#isEvenRow}}evenCell{{/isEvenRow}}{{^isEvenRow}}oddCell{{/isEvenRow}},{{#rowIndex0}}tableColumnHeader{{/rowIndex0}}{{^rowIndex0}}{{#isMiddleCell}}textMiddle{{/isMiddleCell}}{{^isMiddleCell}}textLeft{{/isMiddleCell}}{{/rowIndex0}}" columnSpan="{{colSpan}}"/>\r\n        {{/cells}}\r\n    </TableRow>\r\n    {{/rows}}\r\n</Table>\r\n{{/nbrColumns7}}\r\n{{#nbrColumns8}}\r\n<Table columnWidths="inf,inf,inf,inf,inf,inf,inf,inf">\r\n    {{#rows}}\r\n    <TableRow>\r\n        {{#cells}}\r\n        <TextCell text="{{text}}" styleNames="{{#isEvenRow}}evenCell{{/isEvenRow}}{{^isEvenRow}}oddCell{{/isEvenRow}},{{#rowIndex0}}textMiddle{{/rowIndex0}}{{^rowIndex0}}{{#isMiddleCell}}textMiddle{{/isMiddleCell}}{{^isMiddleCell}}textLeft{{/isMiddleCell}}{{/rowIndex0}}" columnSpan="{{colSpan}}"/>\r\n        {{/cells}}\r\n    </TableRow>\r\n    {{/rows}}\r\n</Table>\r\n{{/nbrColumns8}}\r\n{{#nbrColumns9}}\r\n<Table columnWidths="inf,inf,inf,inf,inf,inf,inf,inf,inf">\r\n    {{#rows}}\r\n    <TableRow>\r\n        {{#cells}}\r\n        <TextCell text="{{text}}" styleNames="{{#isEvenRow}}evenCell{{/isEvenRow}}{{^isEvenRow}}oddCell{{/isEvenRow}},{{#rowIndex0}}textMiddle{{/rowIndex0}}{{^rowIndex0}}{{#isMiddleCell}}textMiddle{{/isMiddleCell}}{{^isMiddleCell}}textLeft{{/isMiddleCell}}{{/rowIndex0}}" columnSpan="{{colSpan}}"/>\r\n        {{/cells}}\r\n    </TableRow>\r\n    {{/rows}}\r\n</Table>\r\n{{/nbrColumns9}}\r\n{{/table}}',
  "visualizer-table-measurment":
    '{{#table}}\r\n{{#nbrColumns3}}\r\n<Table columnWidths="20,45">\r\n    {{#rows}}\r\n    <TableRow>\r\n        {{#cells}}{{#cellIndex0}}\r\n        <TextCell text="{{text}}" styleNames="topBottomPaddingCell,textLeft" columnSpan="{{colSpan}}"/>\r\n        {{/cellIndex0}}{{/cells}}\r\n        <TextCell text="{{#cells}}{{#cellIndex1}}{{text}}{{/cellIndex1}} {{#cellIndex2}}{{text}}{{/cellIndex2}}{{/cells}}" styleNames="topBottomPaddingCell,textRight" columnSpan="{{colSpan}}"/>\r\n    </TableRow>\r\n    {{/rows}}\r\n</Table>\r\n{{/nbrColumns3}}\r\n{{/table}}',
};
