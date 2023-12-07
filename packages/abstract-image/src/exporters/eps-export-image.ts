import * as AI from "../model/index";
import * as R from "ramda";

type CharacterEncoding = "standard-encoding" | "iso-latin-1-encoding";

export function epsExportImage(root: AI.AbstractImage): string;
export function epsExportImage(root: AI.AbstractImage, characterEncoding: "standard-encoding"): string;
export function epsExportImage(root: AI.AbstractImage, characterEncoding: "iso-latin-1-encoding"): Uint8Array;
export function epsExportImage(root: AI.AbstractImage, characterEncoding?: CharacterEncoding): string | Uint8Array {
  if (characterEncoding === "iso-latin-1-encoding") {
    const eps = [
      ...createEpsHeaderLines(root),
      ...createIsoLatin1FontLines(root),
      ...R.unnest<string>(root.components.map((c) => epsExportComponent(c, root.size.height, "iso-latin-1-encoding"))),
    ].join("\n");
    return encodeLatin1Encoding(eps);
  } else {
    return [
      ...createEpsHeaderLines(root),
      ...R.unnest<string>(root.components.map((c) => epsExportComponent(c, root.size.height, "standard-encoding"))),
    ].join("\n");
  }
}

function createEpsHeaderLines(root: AI.AbstractImage): ReadonlyArray<string> {
  return [
    "%!PS-Adobe-3.0 EPSF-3.0",
    `%%BoundingBox: 0 0 ${root.size.width} ${root.size.height}`,
    "/ellipse {7 dict begin",
    "/endangle exch def",
    "/startangle exch def",
    "/yradius exch def",
    "/xradius exch def",
    "/yC exch def",
    "/xC exch def",
    "/savematrix matrix currentmatrix def",
    "xC yC translate",
    "xradius yradius scale",
    "0 0 1 startangle endangle arc",
    "savematrix setmatrix",
    "end",
    "} def",
  ];
}

function epsExportComponent(c: AI.Component, height: number, characterEncoding: CharacterEncoding): Array<string> {
  switch (c.type) {
    case "ellipse": {
      const cx = (c.topLeft.x + c.bottomRight.x) * 0.5;
      const cy = height - (c.topLeft.y + c.bottomRight.y) * 0.5;
      const rx = 0.5 * (c.bottomRight.x - c.topLeft.x);
      const ry = 0.5 * (c.bottomRight.y - c.topLeft.y);
      return [
        ...getColored(c.fillColor, [`${cx} ${cy} ${rx} ${ry} 0 360 ellipse`, "closepath", "fill"]),
        ...getColored(c.strokeColor, [
          `${cx} ${cy} ${rx} ${ry} 0 360 ellipse`,
          "closepath",
          `${c.strokeThickness} setlinewidth`,
          "stroke",
        ]),
      ];
    }
    case "group": {
      return R.unnest<string>(c.children.map((cc) => epsExportComponent(cc, height, characterEncoding)));
    }
    case "line": {
      return getColored(c.strokeColor, [
        `${c.start.x} ${height - c.start.y} moveto`,
        `${c.end.x} ${height - c.end.y} lineto`,
        `${c.strokeThickness} setlinewidth`,
        "stroke",
      ]);
    }
    case "polygon": {
      return [
        ...getColored(c.fillColor, [
          `${c.points[0].x} ${height - c.points[0].y} moveto`,
          ...c.points.map((p) => `${p.x} ${height - p.y} lineto`),
          "closepath",
          `${c.strokeThickness} setlinewidth`,
          "fill",
        ]),
        ...getColored(c.strokeColor, [
          `${c.points[0].x} ${height - c.points[0].y} moveto`,
          ...c.points.map((p) => `${p.x} ${height - p.y} lineto`),
          "closepath",
          "stroke",
        ]),
      ];
    }
    case "polyline": {
      return getColored(c.strokeColor, [
        `${c.points[0].x} ${height - c.points[0].y} moveto`,
        ...c.points.map((p) => `${p.x} ${height - p.y} lineto`),
        `${c.strokeThickness} setlinewidth`,
        "stroke",
      ]);
    }
    case "rectangle": {
      const w = c.bottomRight.x - c.topLeft.x;
      const h = c.bottomRight.y - c.topLeft.y;
      return [
        ...getColored(c.fillColor, [`${c.topLeft.x} ${height - c.bottomRight.y} ${w} ${h} rectfill`]),
        ...getColored(c.strokeColor, [
          `${c.strokeThickness} setlinewidth`,
          `${c.topLeft.x} ${height - c.bottomRight.y} ${w} ${h} rectstroke`,
        ]),
      ];
    }
    case "text": {
      return getColored(c.textColor, [
        `gsave`,
        `/${createFontName(characterEncoding, c.fontFamily)} findfont`,
        `${c.fontSize} scalefont setfont`,
        `${c.position.x} ${height - c.position.y} moveto`,
        getTextXOffset(c),
        getTextYOffset(c),
        `rmoveto`,
        `${-c.clockwiseRotationDegrees} rotate`,
        `(${c.text}) show`,
        `grestore`,
      ]);
    }
    default:
      return [];
  }
}

function getTextXOffset(c: AI.Text): string {
  if (c.horizontalGrowthDirection === "left") {
    return `(${c.text}) stringwidth pop neg`;
  } else if (c.horizontalGrowthDirection === "uniform") {
    return `(${c.text}) stringwidth pop neg 0.5 mul`;
  } else {
    return `0`;
  }
}

function getTextYOffset(c: AI.Text): string {
  if (c.verticalGrowthDirection === "down") {
    return `gsave (${c.text}) true charpath pathbbox exch pop 3 -1 roll pop sub grestore`;
  } else if (c.verticalGrowthDirection === "uniform") {
    return `gsave (${c.text}) true charpath pathbbox exch pop 3 -1 roll pop sub 0.5 mul grestore`;
  } else {
    return `0`;
  }
}

function getColored(color: AI.Color, instructions: Array<string>): Array<string> {
  if (color.a === 0) {
    return [];
  }
  return [`${color.r / 255} ${color.g / 255} ${color.b / 255} setrgbcolor`, ...instructions];
}

function createFontName(characterEncoding: CharacterEncoding, fontFamily: string): string {
  if (characterEncoding === "iso-latin-1-encoding") {
    return `${fontFamily}-ISOLatin1`;
  } else {
    return fontFamily;
  }
}

function encodeLatin1Encoding(text: string): Uint8Array {
  // ISOLatin1Encoding is close to iso-8859-1 encoding (https://en.wikipedia.org/wiki/PostScript_Latin_1_Encoding)
  // Code points 0-256 returned by codePointAt() maps to iso-8859-1
  const unknownCharacter = "?".codePointAt(0) || 32;
  const output: Array<number> = [];
  // Array.from() to handle characters consisting of multiple code points
  for (const c of Array.from(text)) {
    if (c.length > 1) {
      output.push(unknownCharacter);
    } else {
      const cp = c.codePointAt(0) || 32;
      if (cp > 255) {
        output.push(unknownCharacter);
      }
      output.push(cp);
    }
  }
  return new Uint8Array(output);
}

function createIsoLatin1FontLines(root: AI.AbstractImage): ReadonlyArray<string> {
  const fontFamilies = getUsedFontFamilies(root.components);
  const lines = [];
  for (const fontFamily of fontFamilies) {
    // 1. Makes a copy of the font dictionary, including all entries except the one whose
    // key is FID. (This exclusion is necessary only in LanguageLevel 1; in Language-
    // Level 2, the interpreter ignores any existing FID entry in a font being defined.)
    //
    // 2. Installs the desired change: replaces the font’s Encoding array with the value of
    // ISOLatin1Encoding, which is a built-in, 256-element array of character names
    // defined in systemdict.
    //
    // 3. Registers this modified font under a new name (Helvetica-ISOLatin1).
    //
    // https://www.adobe.com/jp/print/postscript/pdfs/PLRM.pdf
    lines.push(
      ...[
        `/${fontFamily} findfont`,
        "dup length dict begin",
        "  { 1 index /FID ne",
        "      {def}",
        "      {pop pop}",
        "    ifelse",
        "  } forall",
        "  /Encoding ISOLatin1Encoding def",
        "  currentdict",
        "end",
        `/${createFontName("iso-latin-1-encoding", fontFamily)} exch definefont pop`,
      ]
    );
  }
  return lines;
}

function getUsedFontFamilies(components: ReadonlyArray<AI.Component>): ReadonlyArray<string> {
  const families = [];
  for (const c of components) {
    switch (c.type) {
      case "text":
        families.push(c.fontFamily);
        break;
      case "group":
        families.push(...getUsedFontFamilies(c.children));
        break;
      default:
        break;
    }
  }
  return R.uniq(families);
}
