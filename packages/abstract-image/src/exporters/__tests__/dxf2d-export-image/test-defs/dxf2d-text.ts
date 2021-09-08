import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

const components = [
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
    AbstractImage.black
  ),
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const dxf = AbstractImage.dxf2dExportImage(image);

export const test: ExportTestDef = {
  name: "dxf2d text",
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
TEXT
8
Text
10
200
20
200
30
0.0
11
200
21
200
31
0.0
40
10
1
Test
72
1
73
2
0
ENDSEC
0
EOF`,
};
