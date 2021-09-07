import { ExportTestDef } from "../export-test-def";
import * as AbstractImage from "../../../../../src/index";

const components = [
  AbstractImage.createEllipse(
    AbstractImage.createPoint(80, 40),
    AbstractImage.createPoint(100, 60),
    AbstractImage.black,
    1,
    AbstractImage.blue
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
  name: "dxf2d ellipse",
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
1
66
1
0
VERTEX
8
1
10
100
20
350
30
0.0
0
VERTEX
8
1
10
99.80785280403231
20
348.0490967798387
30
0.0
0
VERTEX
8
1
10
99.23879532511287
20
346.1731656763491
30
0.0
0
VERTEX
8
1
10
98.31469612302546
20
344.444297669804
30
0.0
0
VERTEX
8
1
10
97.07106781186548
20
342.9289321881345
30
0.0
0
VERTEX
8
1
10
95.55570233019603
20
341.68530387697456
30
0.0
0
VERTEX
8
1
10
93.8268343236509
20
340.76120467488715
30
0.0
0
VERTEX
8
1
10
91.95090322016128
20
340.19214719596766
30
0.0
0
VERTEX
8
1
10
90
20
340
30
0.0
0
VERTEX
8
1
10
88.04909677983872
20
340.19214719596766
30
0.0
0
VERTEX
8
1
10
86.1731656763491
20
340.76120467488715
30
0.0
0
VERTEX
8
1
10
84.44429766980397
20
341.68530387697456
30
0.0
0
VERTEX
8
1
10
82.92893218813452
20
342.9289321881345
30
0.0
0
VERTEX
8
1
10
81.68530387697454
20
344.444297669804
30
0.0
0
VERTEX
8
1
10
80.76120467488713
20
346.1731656763491
30
0.0
0
VERTEX
8
1
10
80.19214719596769
20
348.0490967798387
30
0.0
0
VERTEX
8
1
10
80
20
350
30
0.0
0
VERTEX
8
1
10
80.19214719596769
20
351.9509032201613
30
0.0
0
VERTEX
8
1
10
80.76120467488713
20
353.8268343236509
30
0.0
0
VERTEX
8
1
10
81.68530387697454
20
355.555702330196
30
0.0
0
VERTEX
8
1
10
82.92893218813452
20
357.0710678118655
30
0.0
0
VERTEX
8
1
10
84.44429766980397
20
358.31469612302544
30
0.0
0
VERTEX
8
1
10
86.1731656763491
20
359.23879532511285
30
0.0
0
VERTEX
8
1
10
88.04909677983872
20
359.8078528040323
30
0.0
0
VERTEX
8
1
10
90
20
360
30
0.0
0
VERTEX
8
1
10
91.95090322016128
20
359.80785280403234
30
0.0
0
VERTEX
8
1
10
93.8268343236509
20
359.23879532511285
30
0.0
0
VERTEX
8
1
10
95.55570233019601
20
358.31469612302544
30
0.0
0
VERTEX
8
1
10
97.07106781186548
20
357.0710678118655
30
0.0
0
VERTEX
8
1
10
98.31469612302546
20
355.555702330196
30
0.0
0
VERTEX
8
1
10
99.23879532511286
20
353.8268343236509
30
0.0
0
VERTEX
8
1
10
99.80785280403231
20
351.9509032201613
30
0.0
0
VERTEX
8
1
10
100
20
350
30
0.0
0
SEQEND
8
1
0
ENDSEC
0
EOF`,
};
