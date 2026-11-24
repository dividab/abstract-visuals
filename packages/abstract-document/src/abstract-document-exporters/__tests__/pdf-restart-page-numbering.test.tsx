import PDFParser from "pdf2json";
// oxlint-disable-next-line import/no-named-as-default -- standard pdfkit import idiom
import PDFDocument from "pdfkit";
import { describe, test, expect } from "vitest";
import { AbstractDoc, LinkTarget, PageBreak, Paragraph, Section, TextField, TextRun, render } from "../../abstract-document-jsx/index.js";
import { abstractDocXml } from "../../abstract-document-xml/abstract-doc-of-xml/abstract-doc-of-xml.js";
import { section as sectionXsd } from "../../abstract-document-xml/xsd-template/elements.js";
import * as AD from "../../abstract-document/index.js";
import { measure } from "../pdf/measure.js";
import { paginate } from "../pdf/paginate.js";
import { preProcess } from "../pdf/pre-process.js";
import { exportToBytes } from "../pdf/render.js";
import { registerDefaultStdFonts } from "../pdf/std-fonts.js";
import { updatePageRefs } from "../pdf/update-refs.js";

describe("page numbering without restartPageNumbering", () => {
  test("a section's restartPageNumbering defaults to false", () => {
    expect(AD.Section.create().restartPageNumbering).toBe(false);
    expect(AD.Section.create({}).restartPageNumbering).toBe(false);
    expect(AD.Section.create({ id: "a" }, []).restartPageNumbering).toBe(false);
    expect(AD.Section.create({ restartPageNumbering: undefined }).restartPageNumbering).toBe(false);
  });

  test("the pages of a single section are numbered from 1", () => {
    expect(pageNumbers(doc(section("a", 3)))).toEqual(["a:1", "a:2", "a:3"]);
  });

  test("numbering continues across sections", () => {
    expect(pageNumbers(doc(section("a", 2), section("b", 1), section("c", 3)))).toEqual(["a:1", "a:2", "b:3", "c:4", "c:5", "c:6"]);
  });

  test("numbering continues across sections whose pages are split by overflowing content", () => {
    const numbers = pageNumbers(doc(longSection("a"), longSection("b")));
    expect(numbers.filter((n) => n.startsWith("a:")).length).toBeGreaterThan(1);
    expect(numbers.filter((n) => n.startsWith("b:")).length).toBeGreaterThan(1);
    expect(numbers.map((n) => n.split(":")[1])).toEqual(numbers.map((_, i) => String(i + 1)));
  });

  test("restartPageNumbering false numbers like no restartPageNumbering at all", () => {
    expect(pageNumbers(doc(section("a", 2), section("b", 2, false)))).toEqual(pageNumbers(doc(section("a", 2), section("b", 2))));
  });

  test("PageNumber and TotalPages fields render the document's page numbers", async () => {
    expect(await renderedPageNumbers(doc(section("a", 2), section("b", 2)))).toEqual(["1/4", "2/4", "3/4", "4/4"]);
  });

  test("PageNumberOf gives the page a section starts on", async () => {
    const texts = await renderedPageTexts(doc(sectionWithReferenceTo("b"), section("b", 2)));
    expect(texts[0]).toContain("Ref:2");
  });
});

describe("restartPageNumbering", () => {
  test("create keeps restartPageNumbering", () => {
    expect(AD.Section.create({ restartPageNumbering: true }).restartPageNumbering).toBe(true);
    expect(AD.Section.create({ restartPageNumbering: false }).restartPageNumbering).toBe(false);
  });

  test("a section with restartPageNumbering numbers its pages from 1 again", () => {
    expect(pageNumbers(doc(section("a", 2), section("b", 2, true)))).toEqual(["a:1", "a:2", "b:1", "b:2"]);
  });

  test("numbering restarts only on the section's first page, not after each of its page breaks", () => {
    expect(pageNumbers(doc(section("a", 1), section("b", 3, true)))).toEqual(["a:1", "b:1", "b:2", "b:3"]);
  });

  test("numbering restarts only on the section's first page, not on each page its overflowing content is split onto", () => {
    const numbers = pageNumbers(doc(section("a", 2), longSection("b", true)));
    const b = numbers.filter((n) => n.startsWith("b:"));
    expect(b.length).toBeGreaterThan(1);
    expect(b).toEqual(b.map((_, i) => `b:${i + 1}`));
  });

  test("sections after a restarted one continue its numbering", () => {
    expect(pageNumbers(doc(section("a", 2), section("b", 2, true), section("c", 2)))).toEqual(["a:1", "a:2", "b:1", "b:2", "c:3", "c:4"]);
  });

  test("each section with restartPageNumbering restarts, also single page sections one after another", () => {
    expect(pageNumbers(doc(section("a", 1), section("b", 1, true), section("c", 1, true), section("d", 2, true)))).toEqual([
      "a:1",
      "b:1",
      "c:1",
      "d:1",
      "d:2",
    ]);
  });

  test("restartPageNumbering on the first section changes nothing", () => {
    expect(pageNumbers(doc(section("a", 2, true), section("b", 2)))).toEqual(["a:1", "a:2", "b:3", "b:4"]);
  });

  test("the same section object used twice in a document restarts both times", () => {
    const restarted = render(section("b", 2, true)) as AD.Section.Section;
    const first = render(section("a", 1)) as AD.Section.Section;
    expect(pageNumbers(AD.AbstractDoc.create({}, [first, restarted, restarted]))).toEqual(["a:1", "b:1", "b:2", "b:1", "b:2"]);
  });

  test("PageNumber fields render the restarted page numbers", async () => {
    const numbers = await renderedPageNumbers(doc(section("a", 2), section("b", 2, true)));
    expect(numbers.map((n) => n.split("/")[0])).toEqual(["1", "2", "1", "2"]);
  });

  test("TotalPages still counts every page in the document", async () => {
    // A design choice: the total is of the whole document, not of the pages numbered since the last restart
    const numbers = await renderedPageNumbers(doc(section("a", 2), section("b", 2, true)));
    expect(numbers.map((n) => n.split("/")[1])).toEqual(["4", "4", "4", "4"]);
  });

  test("PageNumberOf a restarted section gives its restarted page number", async () => {
    const texts = await renderedPageTexts(doc(sectionWithReferenceTo("b"), section("b", 2, true)));
    expect(texts[0]).toContain("Ref:1");
  });

  test("PageNumberOf a link target in a restarted section gives the restarted number of its page", async () => {
    const texts = await renderedPageTexts(
      doc(
        sectionWithReferenceTo("target"),
        <Section id="b" restartPageNumbering={true}>
          {body("b", 0)}
          <PageBreak />
          <Paragraph>
            <LinkTarget name="target" />
            <TextRun text="Target" />
          </Paragraph>
        </Section>
      )
    );
    expect(texts[0]).toContain("Ref:2");
  });
});

describe("restartPageNumbering in XML", () => {
  test("the XSD declares restartPageNumbering on Section", () => {
    expect(sectionXsd).toMatch(/<xs:attribute name="restartPageNumbering" type="xs:boolean"/);
  });

  test("a section without the attribute is false", () => {
    expect(xmlSection("")?.restartPageNumbering).toBe(false);
  });

  test("the attribute is parsed as an xs:boolean", () => {
    expect(xmlSection('restartPageNumbering="true"')?.restartPageNumbering).toBe(true);
    expect(xmlSection('restartPageNumbering="1"')?.restartPageNumbering).toBe(true);
    expect(xmlSection('restartPageNumbering="false"')?.restartPageNumbering).toBe(false);
    expect(xmlSection('restartPageNumbering="0"')?.restartPageNumbering).toBe(false);
  });

  test("a section with the attribute restarts numbering when exported", () => {
    const [document] = abstractDocXml(
      `<AbstractDoc>
        <Section id="a"><TextParagraph text="a1"/><PageBreak/><TextParagraph text="a2"/></Section>
        <Section id="b" restartPageNumbering="true"><TextParagraph text="b1"/><PageBreak/><TextParagraph text="b2"/></Section>
        <Section id="c"><TextParagraph text="c1"/></Section>
      </AbstractDoc>`,
      {},
      {}
    );
    expect(pageNumbers(document)).toEqual(["a:1", "a:2", "b:1", "b:2", "c:3"]);
  });
});

function xmlSection(attributes: string): AD.Section.Section | undefined {
  return abstractDocXml(`<AbstractDoc><Section ${attributes}><TextParagraph text="x"/></Section></AbstractDoc>`, {}, {})[0].children[0];
}

function doc(...sections: ReadonlyArray<React.JSX.Element>): AD.AbstractDoc.AbstractDoc {
  return render(<AbstractDoc>{sections}</AbstractDoc>) as AD.AbstractDoc.AbstractDoc;
}

/** A section with the id, of pageCount pages separated by page breaks, each with its "Page <n> of <total>" in the header */
function section(id: string, pageCount: number, restartPageNumbering?: boolean): React.JSX.Element {
  return (
    <Section id={id} page={pageNumberPage} restartPageNumbering={restartPageNumbering}>
      {Array.from({ length: pageCount }, (_, i) => [...(i > 0 ? [<PageBreak key={`break${i}`} />] : []), body(id, i)]).flat()}
    </Section>
  );
}

/** A section with more lines than fit a page, so its pages are split by overflow and not page breaks */
function longSection(id: string, restartPageNumbering?: boolean): React.JSX.Element {
  return (
    <Section id={id} page={pageNumberPage} restartPageNumbering={restartPageNumbering}>
      {Array.from({ length: 150 }, (_, i) => body(id, i))}
    </Section>
  );
}

/** A one page section whose body reads "Ref:<n>", n the page number of the target */
function sectionWithReferenceTo(target: string): React.JSX.Element {
  return (
    <Section id="ref" page={pageNumberPage}>
      <Paragraph>
        <TextRun text="Ref:" />
        <TextField fieldType="PageNumberOf" target={target} />
      </Paragraph>
    </Section>
  );
}

function body(id: string, i: number): React.JSX.Element {
  return (
    <Paragraph>
      <TextRun text={`Body ${id} ${i}`} />
    </Paragraph>
  );
}

const pageNumberPage = AD.MasterPage.create({
  header: [
    render(
      <Paragraph>
        <TextRun text="Page " />
        <TextField fieldType="PageNumber" />
        <TextRun text=" of " />
        <TextField fieldType="TotalPages" />
      </Paragraph>
    ),
  ],
});

/** "<section id>:<page number>" of each page, as the pdf exporter numbers them */
function pageNumbers(document: AD.AbstractDoc.AbstractDoc): ReadonlyArray<string> {
  registerDefaultStdFonts();
  const processed = preProcess(document);
  const pages = updatePageRefs(paginate(processed, measure(PDFDocument, processed)));
  return pages.map((p) => `${p.section.id}:${p.pageNo}`);
}

/** "<page number>/<total pages>" as rendered in each page's header */
async function renderedPageNumbers(document: AD.AbstractDoc.AbstractDoc): Promise<ReadonlyArray<string>> {
  const texts = await renderedPageTexts(document);
  return texts.map((t) => {
    const match = /Page(\d+)of(\d+)/.exec(t);
    if (!match) {
      throw new Error(`No page number in: ${t}`);
    }
    return `${match[1]}/${match[2]}`;
  });
}

/** The text of each page of the exported pdf, all whitespace removed */
async function renderedPageTexts(document: AD.AbstractDoc.AbstractDoc): Promise<ReadonlyArray<string>> {
  const bytes = await exportToBytes(document);
  // pdf2json requires an unpooled buffer, as in pdf.test.tsx
  const buffer = Buffer.alloc(bytes.length);
  buffer.set(bytes);
  const parsed = (await getJsonFromPdf(buffer)) as {
    readonly Pages: ReadonlyArray<{ readonly Texts: ReadonlyArray<{ readonly R: ReadonlyArray<{ readonly T: string }> }> }>;
  };
  return parsed.Pages.map((p) =>
    p.Texts.flatMap((t) => t.R.map((r) => decodeURIComponent(r.T)))
      .join("")
      .replaceAll(/\s/g, "")
  );
}

function getJsonFromPdf(pdfBuffer: Buffer): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", (errData: { parserError: string }) => {
      reject(errData);
    });
    pdfParser.on("pdfParser_dataReady", (pdfData: unknown) => {
      resolve(pdfData);
    });
    pdfParser.parseBuffer(pdfBuffer);
  });
}
