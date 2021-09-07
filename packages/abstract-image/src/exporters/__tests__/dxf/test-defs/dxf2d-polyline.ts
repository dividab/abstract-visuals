import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

const components = [
  AbstractImage.createPolyLine(
    [AbstractImage.createPoint(10, 10), AbstractImage.createPoint(390, 390), AbstractImage.createPoint(390, 10)],
    AbstractImage.brown,
    2
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
  name: "dxf2d polyline",
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
390
30
0.0
0
VERTEX
8
0
10
390
20
10
30
0.0
0
VERTEX
8
0
10
390
20
390
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
