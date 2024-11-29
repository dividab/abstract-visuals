import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const components = [
  AbstractImage.createPolygon(
    [
      AbstractImage.createPoint(110, 10),
      AbstractImage.createPoint(100, 20),
      AbstractImage.createPoint(110, 30),
      AbstractImage.createPoint(100, 40),
      AbstractImage.createPoint(110, 50),
    ],
    AbstractImage.blue,
    2,
    AbstractImage.red
  ),
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const eps = AbstractImage.epsExportImage(image);

export const testEpsPolygon: ExportTestDef = {
  name: "eps polygon",
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
1 0 0 setrgbcolor
110 390 moveto
110 390 lineto
100 380 lineto
110 370 lineto
100 360 lineto
110 350 lineto
closepath
2 setlinewidth
fill
0 0 1 setrgbcolor
110 390 moveto
110 390 lineto
100 380 lineto
110 370 lineto
100 360 lineto
110 350 lineto
closepath
stroke`,
};
