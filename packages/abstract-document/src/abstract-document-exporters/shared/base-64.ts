export function toBase64(u8: Uint8Array): string {
  const imageFormat = u8[0] === 0xff && u8[1] === 0xd8 ? "image/jpeg" : "image/png";
  // Node
  if (typeof Buffer !== "undefined") {
    return `data:${imageFormat};base64,${Buffer.from(u8).toString("base64")}`;
  }
  // Browser
  let bin = "";
  for (const e of u8) {
    bin += String.fromCharCode(e);
  }

  return `data:${imageFormat};base64,${btoa(bin)}`;
}

export const rawSvgPrefix = "data:image/svg+xml,";

export function fromBase64(b64: string): Uint8Array {
  const prefixEnd = b64.indexOf(",");
  const data = prefixEnd >= 0 ? b64.slice(prefixEnd + 1) : b64;

  // Node
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(data, "base64"));
  }

  // Browser
  const bin = atob(data);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    u8[i] = bin.charCodeAt(i);
  }
  return u8;
}
