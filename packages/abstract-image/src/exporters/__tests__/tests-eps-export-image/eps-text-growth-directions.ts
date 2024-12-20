import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const components = [
  AbstractImage.createText(
    AbstractImage.createPoint(10, 10),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "bold",
    0,
    "center",
    "left",
    "up",
    2,
    AbstractImage.red,
    false
  ),
  AbstractImage.createText(
    AbstractImage.createPoint(10, 30),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "bold",
    0,
    "center",
    "uniform",
    "uniform",
    2,
    AbstractImage.red,
    false
  ),
  AbstractImage.createText(
    AbstractImage.createPoint(10, 50),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "bold",
    0,
    "left",
    "right",
    "down",
    2,
    AbstractImage.red,
    false
  ),
  AbstractImage.createText(
    AbstractImage.createPoint(10, 70),
    "Hello World",
    "Arial",
    12,
    AbstractImage.black,
    "bold",
    0,
    "right",
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

export const testEpsTextGrowthDirections: ExportTestDef = {
  name: "eps text growth directions",
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
(Hello World) stringwidth pop neg
0
rmoveto
0 rotate
(Hello World) show
grestore
0 0 0 setrgbcolor
gsave
/Arial findfont
12 scalefont setfont
10 370 moveto
(Hello World) stringwidth pop neg 0.5 mul
gsave (Hello World) true charpath pathbbox exch pop 3 -1 roll pop sub 0.5 mul grestore
rmoveto
0 rotate
(Hello World) show
grestore
0 0 0 setrgbcolor
gsave
/Arial findfont
12 scalefont setfont
10 350 moveto
0
gsave (Hello World) true charpath pathbbox exch pop 3 -1 roll pop sub grestore
rmoveto
0 rotate
(Hello World) show
grestore
0 0 0 setrgbcolor
gsave
/Arial findfont
12 scalefont setfont
10 330 moveto
0
gsave (Hello World) true charpath pathbbox exch pop 3 -1 roll pop sub grestore
rmoveto
0 rotate
(Hello World) show
grestore`,
};
