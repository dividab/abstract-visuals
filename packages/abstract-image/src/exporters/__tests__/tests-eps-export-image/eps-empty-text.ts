import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const components = [
  AbstractImage.createText(
    AbstractImage.createPoint(10, 10),
    "",
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

const eps = AbstractImage.epsExportImage(image);

export const testEpsEmptyText: ExportTestDef = {
  name: "eps empty text",
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
0 0 0 setrgbcolor
gsave
/Arial findfont
12 scalefont setfont
10 390 moveto
0
gsave () true charpath pathbbox exch pop 3 -1 roll pop sub grestore
rmoveto
0 rotate
() show
grestore`,
};
