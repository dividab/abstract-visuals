import * as S from "stream";
import jszip from "jszip";
import { describe, test, expect } from "vitest";
import { AbstractDoc, PageBreak, Paragraph, Section, TextField, TextRun, render } from "../../abstract-document-jsx/index.js";
import { abstractDocXml } from "../../abstract-document-xml/abstract-doc-of-xml/abstract-doc-of-xml.js";
import type * as AD from "../../abstract-document/index.js";
import { exportToStream } from "../docx2/render.js";
import { streamToBuffer } from "./test-utils/index.js";

// Word numbers the pages itself when it lays out the document, so the docx can't be checked for the numbers on each page, only for each section's
// <w:pgNumType>: w:start="1" restarts the numbering at the section, no w:start continues it from the section before

describe("docx page numbering without restartPageNumbering", () => {
  test("no section restarts its numbering", async () => {
    expect(await pageNumberStarts(doc(section("a", 2), section("b", 1), section("c", 2)))).toEqual([undefined, undefined, undefined]);
  });

  test("restartPageNumbering false doesn't restart the numbering", async () => {
    expect(await pageNumberStarts(doc(section("a", 1), section("b", 1, false)))).toEqual([undefined, undefined]);
  });

  test("each section still has a <w:pgNumType>, as before", async () => {
    const xml = await documentXml(doc(section("a", 1), section("b", 1)));
    expect(sectionProperties(xml).map((s) => /<w:pgNumType\b/.test(s))).toEqual([true, true]);
  });
});

describe("docx restartPageNumbering", () => {
  test("a section with restartPageNumbering starts its numbering at 1", async () => {
    expect(await pageNumberStarts(doc(section("a", 2), section("b", 2, true)))).toEqual([undefined, "1"]);
  });

  test("only the sections with restartPageNumbering restart, the ones after them continue", async () => {
    expect(await pageNumberStarts(doc(section("a", 1), section("b", 2, true), section("c", 1), section("d", 1, true)))).toEqual([
      undefined,
      "1",
      undefined,
      "1",
    ]);
  });

  test("a section with the attribute in XML restarts the numbering, '1' like 'true', and '0' and 'false' don't", async () => {
    const [document] = abstractDocXml(
      `<AbstractDoc>
        <Section id="a"><TextParagraph text="a1"/></Section>
        <Section id="b" restartPageNumbering="true"><TextParagraph text="b1"/><PageBreak/><TextParagraph text="b2"/></Section>
        <Section id="c"><TextParagraph text="c1"/></Section>
        <Section id="d" restartPageNumbering="1"><TextParagraph text="d1"/></Section>
        <Section id="e" restartPageNumbering="0"><TextParagraph text="e1"/></Section>
        <Section id="f" restartPageNumbering="false"><TextParagraph text="f1"/></Section>
      </AbstractDoc>`,
      {},
      {}
    );
    expect(await pageNumberStarts(document)).toEqual([undefined, "1", undefined, "1", undefined, undefined]);
  });
});

function doc(...sections: ReadonlyArray<React.JSX.Element>): AD.AbstractDoc.AbstractDoc {
  return render(<AbstractDoc>{sections}</AbstractDoc>) as AD.AbstractDoc.AbstractDoc;
}

/** A section with the id, of pageCount pages separated by page breaks, each with its page number */
function section(id: string, pageCount: number, restartPageNumbering?: boolean): React.JSX.Element {
  return (
    <Section id={id} restartPageNumbering={restartPageNumbering}>
      {Array.from({ length: pageCount }, (_, i) => [
        ...(i > 0 ? [<PageBreak key={`break${i}`} />] : []),
        <Paragraph key={`body${i}`}>
          <TextRun text={`Body ${id} ${i} page `} />
          <TextField fieldType="PageNumber" />
        </Paragraph>,
      ]).flat()}
    </Section>
  );
}

/** The w:start of each section's <w:pgNumType>, in document order, undefined where there is none */
async function pageNumberStarts(document: AD.AbstractDoc.AbstractDoc): Promise<ReadonlyArray<string | undefined>> {
  return sectionProperties(await documentXml(document)).map((s) => /<w:pgNumType\b[^>]*\bw:start="(\d+)"/.exec(s)?.[1]);
}

/** Each section's <w:sectPr>, in document order: the last section's is in the body, the others' in the last paragraph of their section */
function sectionProperties(xml: string): ReadonlyArray<string> {
  return xml.match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/g) ?? [];
}

async function documentXml(document: AD.AbstractDoc.AbstractDoc): Promise<string> {
  const stream = new S.PassThrough();
  exportToStream(stream, document);
  const zip = await jszip.loadAsync(await streamToBuffer(stream));
  return (await zip.file("word/document.xml")?.async("string")) ?? "";
}
