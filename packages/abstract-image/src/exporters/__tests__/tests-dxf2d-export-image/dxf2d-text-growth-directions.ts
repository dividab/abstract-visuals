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

const dxf = AbstractImage.dxf2dExportImage(image);

export const testDxf2dTextGrowthDirections: ExportTestDef = {
  name: "dxf text growth directions",
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
BLOCKS
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
10
20
390
30
0.0
11
10
21
390
31
0.0
40
10
1
Hello World
72
2
73
0
0
TEXT
8
Text
10
10
20
370
30
0.0
11
10
21
370
31
0.0
40
10
1
Hello World
72
1
73
2
0
TEXT
8
Text
10
10
20
350
30
0.0
11
10
21
350
31
0.0
40
10
1
Hello World
72
0
73
3
0
TEXT
8
Text
10
10
20
330
30
0.0
11
10
21
330
31
0.0
40
10
1
Hello World
72
0
73
3
0
ENDSEC
0
EOF`,
};
