import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const components = [
  AbstractImage.createLine(
    AbstractImage.createPoint(200, 0),
    AbstractImage.createPoint(200, 400),
    AbstractImage.green,
    1
  ),
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const dxf = AbstractImage.dxf2dExportImage(image);

export const testDxf2dLine: ExportTestDef = {
  name: "dxf2d line",
  abstractImage: dxf,
  expectedImage: `999
ELIGO DXF GENERATOR
0
SECTION
2
HEADER
9
$ACADVER
1
AC1009
9
$INSBASE
10
0.0
20
0.0
30
0.0
9
$EXTMIN
10
0.0
20
0.0
9
$EXTMAX
10
400
20
400
0
ENDSEC
0
SECTION
2
ENTITIES
0
LINE
8
Lines
10
200
20
400
30
0.0
11
200
21
0
31
0.0
0
ENDSEC
0
EOF`,
};
