import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

const components = [
  AbstractImage.createGroup("group", [
    AbstractImage.createText(
      AbstractImage.createPoint(200, 200),
      "Test",
      "Helvetica",
      12,
      AbstractImage.black,
      "normal",
      0,
      "center",
      "uniform",
      "uniform",
      0,
      AbstractImage.black,
      false
    ),
    AbstractImage.createRectangle(
      AbstractImage.createPoint(10, 50),
      AbstractImage.createPoint(50, 60),
      AbstractImage.blue,
      2,
      AbstractImage.red
    ),
  ]),
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const eps = AbstractImage.epsExportImage(image);

export const test: ExportTestDef = {
  name: "eps group",
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
/Helvetica findfont
12 scalefont setfont
200 200 moveto
(Test) stringwidth pop neg 0.5 mul
gsave (Test) true charpath pathbbox exch pop 3 -1 roll pop sub 0.5 mul grestore
rmoveto
0 rotate
(Test) show
grestore
1 0 0 setrgbcolor
10 340 40 10 rectfill
0 0 1 setrgbcolor
2 setlinewidth
10 340 40 10 rectstroke`,
};
