import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const components = [
  AbstractImage.createPolygon(
    [AbstractImage.createPoint(200, 250), AbstractImage.createPoint(250, 250), AbstractImage.createPoint(200, 200)],
    AbstractImage.yellow,
    2,
    AbstractImage.gray
  ),
];
const image = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  components
);

const dxf = AbstractImage.dxf2dExportImage(image);

export const testDxf2dPolygon: ExportTestDef = {
  name: "dxf2d polygon",
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
200
20
150
30
0.0
0
VERTEX
8
0
10
250
20
150
30
0.0
0
VERTEX
8
0
10
200
20
200
30
0.0
0
VERTEX
8
0
10
200
20
150
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
