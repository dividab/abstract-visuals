import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const components = [
  AbstractImage.createLine(
    AbstractImage.createPoint(10, 100),
    AbstractImage.createPoint(40, 70),
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

export const testEpsLine: ExportTestDef = {
  name: "eps line",
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
10 300 moveto
40 330 lineto
2 setlinewidth
stroke`,
};
