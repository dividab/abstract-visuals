import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const components = [
  AbstractImage.createEllipse(
    AbstractImage.createPoint(50, 50),
    AbstractImage.createPoint(100, 100),
    AbstractImage.green,
    2,
    AbstractImage.yellow
  ),
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const eps = AbstractImage.epsExportImage(image);

export const testEpsEllipse: ExportTestDef = {
  name: "eps ellipse",
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
1 1 0 setrgbcolor
75 325 25 25 0 360 ellipse
closepath
fill
0 0.5019607843137255 0 setrgbcolor
75 325 25 25 0 360 ellipse
closepath
2 setlinewidth
stroke`,
};
