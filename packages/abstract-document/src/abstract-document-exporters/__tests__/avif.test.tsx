import * as AI from "abstract-image";
import jszip from "jszip";
import { describe, test, expect } from "vitest";
import { AbstractDoc, Paragraph, Section, Image, render } from "../../abstract-document-jsx/index.js";
import type * as AD from "../../abstract-document/index.js";
import { exportToHTML5Blob as exportDocxToBlob } from "../docx2/render.js";
import { exportToBytes as exportPdfToBytes } from "../pdf/render.js";
import { avifToPng, isAvif, transcodeAvifImages } from "../shared/avif-to-png.js";

// 8x8 px AVIF
const avifEncoded =
  "AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAACAAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAgAAAAIAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAChtZGF0EgAKCBgIv2CBAQNCMhIYAAooooQAQbJEjZ90X1TtD6A=";
const avifBytes = new Uint8Array(Buffer.from(avifEncoded, "base64"));
const pngSignature = [0x89, 0x50, 0x4e, 0x47];

const imageResource = (binaryImage: AI.Component): AD.ImageResource.ImageResource => ({
  id: "avif",
  renderScale: 1.0,
  abstractImage: AI.createAbstractImage({ x: 0, y: 0 }, { width: 200, height: 150 }, AI.white, [binaryImage]),
});

const avifBytesImage = AI.createBinaryImage({ x: 0, y: 0 }, { x: 200, y: 150 }, "avif", { type: "bytes", bytes: avifBytes });
const avifUrlImage = AI.createBinaryImage({ x: 0, y: 0 }, { x: 200, y: 150 }, "avif", {
  type: "url",
  url: `data:image/avif;base64,${avifEncoded}`,
});

const docWith = (binaryImage: AI.Component): AD.AbstractDoc.AbstractDoc =>
  render(
    <AbstractDoc>
      <Section>
        <Paragraph>
          <Image width={200} height={150} imageResource={imageResource(binaryImage)} />
        </Paragraph>
      </Section>
    </AbstractDoc>
  ) as AD.AbstractDoc.AbstractDoc;

describe("avif", () => {
  test("isAvif", () => {
    expect(isAvif(avifBytes)).toBe(true);
    expect(isAvif(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]))).toBe(false);
    expect(isAvif(new Uint8Array())).toBe(false);
  });

  test("avifToPng", async () => {
    expect([...(await avifToPng(avifBytes)).subarray(0, 4)]).toEqual(pngSignature);
  });

  test("transcodeAvifImages rewrites bytes and data uri images to png", async () => {
    const [fromBytes, fromUrl] = await Promise.all([transcodeAvifImages(avifBytesImage), transcodeAvifImages(avifUrlImage)]);
    expect(fromBytes.format).toBe("png");
    expect(fromBytes.data.type === "bytes" && [...fromBytes.data.bytes.subarray(0, 4)]).toEqual(pngSignature);
    expect(fromUrl.format).toBe("png");
    expect(fromUrl.data.type === "url" && fromUrl.data.url.startsWith("data:image/png;base64,")).toBe(true);
  });

  test("transcodeAvifImages keeps documents without avif as they are", async () => {
    const png = AI.createBinaryImage({ x: 0, y: 0 }, { x: 1, y: 1 }, "png", { type: "bytes", bytes: new Uint8Array(pngSignature) });
    const doc = docWith(png);
    expect(await transcodeAvifImages(doc)).toBe(doc);
  });

  test.each([
    ["bytes", avifBytesImage],
    ["data uri", avifUrlImage],
  ])("exports %s avif to pdf", async (_name, binaryImage) => {
    const pdf = await exportPdfToBytes(docWith(binaryImage));
    expect(new TextDecoder().decode(pdf.subarray(0, 5))).toBe("%PDF-");
  });

  test.each([
    ["bytes", avifBytesImage],
    ["data uri", avifUrlImage],
  ])("exports %s avif to docx as png", async (_name, binaryImage) => {
    const blob = await exportDocxToBlob(docWith(binaryImage));
    const zip = await jszip.loadAsync(await blob.arrayBuffer());
    const media = Object.keys(zip.files).filter((f) => f.startsWith("word/media/"));
    expect(media.some((f) => f.endsWith(".png"))).toBe(true);
    expect(media.some((f) => f.endsWith(".avif"))).toBe(false);
  });
});
