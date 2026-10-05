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

/** IFC GlobalId, derived from `uuid` when it's a valid uuid not used before in the file so re-exports keep the same ids, otherwise random */
export function guid(m: MutableIfc, uuid?: string): string {
  const hex = uuid !== undefined && UUID_REGEX.test(uuid) ? uuid.replaceAll("-", "") : undefined;
  const fromUuid = hex && compressGuid(Array.from({ length: 16 }, (_, i) => parseInt(hex.slice(i * 2, i * 2 + 2), 16)));
  const id = fromUuid && !m.usedGuids.has(fromUuid) ? fromUuid : compressGuid(Array.from(crypto.getRandomValues(new Uint8Array(16))));
  m.usedGuids.add(id);
  return id;
}

export const header = (fileName: string, date: string): string => `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('ViewDefinition [ReferenceView_V1.2]'),'2;1');
FILE_NAME(${str(fileName)},${str(date)},(''),('Divid AB'),'Abstract 3D to IFC Exporter','Abstract 3D','');
FILE_SCHEMA(('IFC4'));
ENDSEC;
DATA;
`;

export const footer = (): string => `ENDSEC;
END-ISO-10303-21;
`;

export const serialize = (m: MutableIfc, fileName: string, date: string): string =>
  header(fileName, date) + m.entities.map((e, i) => `#${i + 1}=${e};\n`).join("") + footer();
