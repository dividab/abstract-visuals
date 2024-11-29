import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const components = [
  AbstractImage.createRectangle(
    AbstractImage.createPoint(10, 50),
    AbstractImage.createPoint(50, 60),
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

export const testEpsRectangle: ExportTestDef = {
  name: "eps rectangle",
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
10 340 40 10 rectfill
0 0 1 setrgbcolor
2 setlinewidth
10 340 40 10 rectstroke`,
};
