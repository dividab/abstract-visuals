export function toBase64String(u8: Uint8Array): string {
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
