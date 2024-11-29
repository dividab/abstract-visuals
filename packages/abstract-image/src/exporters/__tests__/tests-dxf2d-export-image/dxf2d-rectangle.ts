import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const components = [
  AbstractImage.createRectangle(
    AbstractImage.createPoint(10, 50),
    AbstractImage.createPoint(40, 80),
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

const dxf = AbstractImage.dxf2dExportImage(image);

export const testDxf2dRectangle: ExportTestDef = {
  name: "dxf2d rectangle",
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
POLYLINE
8
0
66
1
0
VERTEX
8
0
10
10
20
350
30
0.0
0
VERTEX
8
0
10
40
20
350
30
0.0
0
VERTEX
8
0
10
40
20
320
30
0.0
0
VERTEX
8
0
10
10
20
320
30
0.0
0
VERTEX
8
0
10
10
20
350
30
0.0
0
SEQEND
8
0
0
ENDSEC
0
EOF`,
};
