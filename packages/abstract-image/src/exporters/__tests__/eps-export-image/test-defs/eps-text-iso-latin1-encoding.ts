import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

const components = [
  AbstractImage.createText(
    AbstractImage.createPoint(10, 10),
    "Q [m³/h]",
    "Arial",
    12,
    AbstractImage.black,
    "bold",
    0,
    "center",
    "right",
    "down",
    2,
    AbstractImage.red,
    false
  ),
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const eps = new TextDecoder("iso-8859-1").decode(AbstractImage.epsExportImage(image, "iso-latin-1-encoding"));

export const test: ExportTestDef = {
  name: "eps text",
  abstractImage: eps,
  expectedImage: `%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 0 400 400
/ellipse {7 dict begin
/endangle exch def
/startangle exch def
/yradius exch def
/xradius exch def
/yC exch def
/xC exch def
/savematrix matrix currentmatrix def
xC yC translate
xradius yradius scale
0 0 1 startangle endangle arc
savematrix setmatrix
end
} def
/Arial findfont
dup length dict begin
  { 1 index /FID ne
      {def}
      {pop pop}
    ifelse
  } forall
  /Encoding ISOLatin1Encoding def
  currentdict
end
/Arial-ISOLatin1 exch definefont pop
0 0 0 setrgbcolor
gsave
/Arial-ISOLatin1 findfont
12 scalefont setfont
10 390 moveto
0
gsave (Q [m³/h]) true charpath pathbbox exch pop 3 -1 roll pop sub grestore
rmoveto
0 rotate
(Q [m³/h]) show
grestore`,
};
