import type * as NodeFs from "node:fs/promises";
import type * as NodeModule from "node:module";
import type * as NodePath from "node:path";
import type { BinaryImage } from "abstract-image";
import { fromBase64, toBase64 } from "./base-64.js";

const avifDataUriPrefix = "data:image/avif;base64,";

const ascii = (bytes: Uint8Array): string => String.fromCharCode(...bytes);

/** AVIF is an ISO-BMFF file: a leading `ftyp` box whose brands include `avif` (still) or `avis` (sequence). */
export function isAvif(bytes: Uint8Array): boolean {
  if (bytes.length < 12 || ascii(bytes.subarray(4, 8)) !== "ftyp") {
    return false;
  }
  const boxEnd = Math.min(new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0), bytes.length);
  return /avi[fs]/.test(ascii(bytes.subarray(8, boxEnd)));
}

/**
 * Pdfkit and docx can't embed AVIF, so exporters first rewrite all AVIF binary images in the document to PNG. The decoder (wasm) is only loaded when
 * the document actually contains AVIF.
 */
export async function transcodeAvifImages<T>(value: T): Promise<T> {
  return transcode(value, new Map());
}

async function transcode<T>(value: T, cache: Map<unknown, Promise<Uint8Array>>): Promise<T> {
  if (typeof value !== "object" || value === null || ArrayBuffer.isView(value)) {
    return value;
  }
  if (isBinaryImage(value)) {
    return (await transcodeBinaryImage(value, cache)) as T;
  }
  // Containers are only recreated when something inside changed, so documents without AVIF keep their identity
  const source = value as Record<string, unknown>;
  const entries = await Promise.all(Object.entries(source).map(async ([key, child]) => [key, await transcode(child, cache)] as const));
  if (entries.every(([key, child]) => child === source[key])) {
    return value;
  }
  return (Array.isArray(value) ? entries.map(([, child]) => child) : Object.fromEntries(entries)) as T;
}

function isBinaryImage(value: object): value is BinaryImage {
  return "type" in value && value.type === "binaryimage";
}

async function transcodeBinaryImage(image: BinaryImage, cache: Map<unknown, Promise<Uint8Array>>): Promise<BinaryImage> {
  const toPng = (key: unknown, bytes: () => Uint8Array): Promise<Uint8Array> => {
    const cached = cache.get(key) ?? avifToPng(bytes());
    cache.set(key, cached);
    return cached;
  };
  if (image.data.type === "bytes") {
    const { bytes } = image.data;
    return image.format === "avif" || isAvif(bytes)
      ? { ...image, format: "png", data: { type: "bytes", bytes: await toPng(bytes, () => bytes) } }
      : image;
  }
  const { url } = image.data;
  return url.startsWith(avifDataUriPrefix)
    ? { ...image, format: "png", data: { type: "url", url: toBase64(await toPng(url, () => fromBase64(url))) } }
    : image;
}

export async function avifToPng(avif: Uint8Array): Promise<Uint8Array> {
  const { decode, encode } = await loadCodecs();
  const image = await decode(avif.buffer.slice(avif.byteOffset, avif.byteOffset + avif.byteLength) as ArrayBuffer);
  if (!image) {
    throw new Error("Failed to decode AVIF image");
  }
  return new Uint8Array(await encode(image));
}

type Codecs = {
  readonly decode: (buffer: ArrayBuffer) => Promise<ImageData | null>;
  readonly encode: (image: ImageData) => Promise<ArrayBuffer>;
};

// Initializing the wasm codecs is expensive, so it's done once and shared
const codecsCache = new Map<"codecs", Promise<Codecs>>();

function loadCodecs(): Promise<Codecs> {
  const codecs = codecsCache.get("codecs") ?? initCodecs();
  codecsCache.set("codecs", codecs);
  return codecs;
}

async function initCodecs(): Promise<Codecs> {
  const [avif, png] = await Promise.all([import("@jsquash/avif/decode.js"), import("@jsquash/png/encode.js")]);
  // In the browser the codecs fetch their wasm themselves. Node's fetch can't load file URLs, so there it is read from disk
  if ((globalThis as { readonly process?: { readonly versions?: { readonly node?: string } } }).process?.versions?.node !== undefined) {
    const [avifWasm, pngWasm] = await Promise.all([
      readPackageFile("@jsquash/avif", "codec/dec/avif_dec.wasm"),
      readPackageFile("@jsquash/png", "codec/pkg/squoosh_png_bg.wasm"),
    ]);
    await Promise.all([avif.init({ wasmBinary: avifWasm }), png.init(await WebAssembly.compile(pngWasm))]);
  }
  return { decode: avif.default, encode: png.default };
}

async function readPackageFile(packageName: string, file: string): Promise<Uint8Array<ArrayBuffer>> {
  // Specifiers are held in variables so bundlers targeting the browser don't try to resolve these Node built-ins
  const [moduleSpecifier, fsSpecifier, pathSpecifier] = ["node:module", "node:fs/promises", "node:path"];
  const [nodeModule, nodeFs, nodePath] = (await Promise.all([import(moduleSpecifier), import(fsSpecifier), import(pathSpecifier)])) as [
    typeof NodeModule,
    typeof NodeFs,
    typeof NodePath,
  ];
  const packageEntry = nodeModule.createRequire(import.meta.url).resolve(packageName);
  return new Uint8Array(await nodeFs.readFile(nodePath.join(nodePath.dirname(packageEntry), file)));
}
