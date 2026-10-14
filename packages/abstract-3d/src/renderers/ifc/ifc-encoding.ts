import type { Vec3 } from "../../abstract-3d.js";

export type MutableIfc = { readonly entities: Array<string>; readonly usedGuids: Set<string> };

export const ifcFile = (): MutableIfc => ({ entities: [], usedGuids: new Set() });

/** Appends an entity and returns its #id */
export const add = (m: MutableIfc, entity: string): number => m.entities.push(entity);

export const ref = (id: number): string => `#${id}`;

export const refs = (ids: ReadonlyArray<number>): string => `(${ids.map(ref).join(",")})`;

/** STEP REAL, always with a decimal point, rounded to 6 decimals to keep the file small */
export function real(num: number): string {
  const rounded = Number(num.toFixed(6));
  return Number.isInteger(rounded) ? `${rounded}.` : `${rounded}`;
}

export const point = (p: Vec3): string => `(${real(p.x)},${real(p.y)},${real(p.z)})`;

/** STEP string literal, non-ASCII characters are encoded as \X2\ / \X4\ */
export function str(s: string | undefined): string {
  if (s === undefined) {
    return "$";
  }
  let encoded = "";
  for (const char of s) {
    const cp = char.codePointAt(0) ?? 0;
    if (char === "'") {
      encoded += "''";
    } else if (char === "\\") {
      encoded += "\\\\";
    } else if (cp >= 32 && cp <= 126) {
      encoded += char;
    } else if (cp <= 0xffff) {
      encoded += `\\X2\\${cp.toString(16).toUpperCase().padStart(4, "0")}\\X0\\`;
    } else {
      encoded += `\\X4\\${cp.toString(16).toUpperCase().padStart(8, "0")}\\X0\\`;
    }
  }
  return `'${encoded}'`;
}

const GUID_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$";
const UUID_REGEX = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

/** Encodes a number as a fixed number of base 64 IFC characters */
function base64(num: number, chars: number): string {
  let result = "";
  let rest = num;
  for (let i = 0; i < chars; i++) {
    result = GUID_CHARS[rest % 64]! + result;
    rest = Math.floor(rest / 64);
  }
  return result;
}

/** Compresses 16 bytes into the 22 character IFC GlobalId, first byte into 2 chars, then 5 chunks of 3 bytes into 4 chars */
function compressGuid(bytes: ReadonlyArray<number>): string {
  let guid = base64(bytes[0]!, 2);
  for (let i = 1; i < 16; i += 3) {
    guid += base64(bytes[i]! * 65536 + bytes[i + 1]! * 256 + bytes[i + 2]!, 4);
  }
  return guid;
}

/**
 * IFC GlobalId derived from `id` so re-exports keep the same ids, from a uuid's own bytes and from a hash of any other id. Random without an id or
 * when the id's GlobalId is already used in the file
 */
export function guid(m: MutableIfc, id?: string): string {
  const hex = id !== undefined && UUID_REGEX.test(id) ? id.replaceAll("-", "") : undefined;
  const bytes = hex ? Array.from({ length: 16 }, (_, i) => parseInt(hex.slice(i * 2, i * 2 + 2), 16)) : id === undefined ? undefined : hash128(id);
  const fromId = bytes && compressGuid(bytes);
  const globalId = fromId && !m.usedGuids.has(fromId) ? fromId : compressGuid(Array.from(crypto.getRandomValues(new Uint8Array(16))));
  m.usedGuids.add(globalId);
  return globalId;
}

/** The 16 bytes of cyrb128, a fast non-cryptographic hash */
function hash128(s: string): ReadonlyArray<number> {
  // oxlint-disable no-bitwise
  let [h1, h2, h3, h4] = [1779033703, 3144134277, 1013904242, 2773480762];
  for (let i = 0; i < s.length; i++) {
    const k = s.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4;
  return [h1, h2 ^ h1, h3 ^ h1, h4 ^ h1].flatMap((h) => [(h >>> 24) & 255, (h >>> 16) & 255, (h >>> 8) & 255, h & 255]);
  // oxlint-enable no-bitwise
}

/** FILE_NAME header fields, `originatingSystem` is the application that produced the scene */
export type IfcHeader = {
  readonly fileName: string;
  readonly date: string;
  readonly author: string;
  readonly organization: string;
  readonly originatingSystem: string;
};

export const header = (h: IfcHeader): string => `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('ViewDefinition [ReferenceView_V1.2]'),'2;1');
FILE_NAME(
/* name */ ${str(h.fileName)},
/* time_stamp */ ${str(h.date)},
/* author */ (${str(h.author)}),
/* organization */ (${str(h.organization)}),
/* preprocessor_version */ 'Abstract 3D to IFC Exporter',
/* originating_system */ ${str(h.originatingSystem)},
/* authorization */ 'None');

FILE_SCHEMA(('IFC4'));
ENDSEC;

DATA;
`;

export const footer = (): string => `ENDSEC;
END-ISO-10303-21;
`;

export const serialize = (m: MutableIfc, h: IfcHeader): string => header(h) + m.entities.map((e, i) => `#${i + 1}=${e};\n`).join("") + footer();
