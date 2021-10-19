import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

const components = [
  AbstractImage.createPolyLine(
    [
      AbstractImage.createPoint(10, 40),
      AbstractImage.createPoint(20, 30),
      AbstractImage.createPoint(30, 40),
      AbstractImage.createPoint(40, 30),
      AbstractImage.createPoint(50, 40),
      AbstractImage.createPoint(60, 30),
      AbstractImage.createPoint(70, 40),
    ],
    AbstractImage.black,
    2
  ),
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const eps = AbstractImage.epsExportImage(image);

export const test: ExportTestDef = {
  name: "eps polyline",
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
10 360 moveto
10 360 lineto
20 370 lineto
30 360 lineto
40 370 lineto
50 360 lineto
60 370 lineto
70 360 lineto
2 setlinewidth
stroke`,
};
