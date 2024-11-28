import { Vec3 } from "../../abstract-3d.js";

export const dxf3DFACE = (vec1: Vec3, vec2: Vec3, vec3: Vec3, vec4: Vec3, color: string | undefined): string =>
  `  0
3DFACE
  8
A3D
  6
CONTINUOUS
  62
${color ?? "1"}
  10
${vec1.x}
  20
${vec1.y}
  30
${vec1.z}
  11
${vec2.x}
  21
${vec2.y}
  31
${vec2.z}
  12
${vec3.x}
  22
${vec3.y}
  32
${vec3.z}
  13
${vec4.x}
  23
${vec4.y}
  33
${vec4.z}
`;

export const dxfPOLYLINE = (vertices: ReadonlyArray<Vec3>, color: string): string =>
  `  0
POLYLINE
  8
A3D
  62
${color}
  66
1${vertices.map(
    (v) =>
      `
  0
VERTEX
  8
A3D
  10
${v.x}
  20
${v.y}
  30
${v.z}`
  )}
  0
SEQEND
`;

export const dxfText = (pos: Vec3, fontSize: number, text: string, color: string): string =>
  `  0
Text
  8
A3D
  62
${color}
  10
${pos.x}
  20
${pos.y}
  30
${pos.z}
  11
${pos.x}
  21
${pos.y}
  31
${pos.z}
  40
${fontSize}
  1
${text}
`;

export const dxfHeader = (size: Vec3, center: Vec3): string =>
  `  999
Divid A3D
  0
SECTION
  2
HEADER
  9
$ACADVER
  1
AC1006
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
${0}
 20
${0}
 30
${0}
  9
$EXTMAX
 10
${size.x}
 20
 ${size.y}
 30
 ${size.z}
 0
ENDSEC
  0
SECTION
  2
TABLES
  0
TABLE
  2
APPID
 70
2
  0
APPID
  2
ACAD
 70
1
  0
APPID
  2
A3D
 70
1
  0
ENDTAB
  0
TABLE
  2
LTYPE
 70
1
  0
LTYPE
  2
CONTINUOUS
 70
0
  3
Solid line
 72
65
 73
0
 40
0.0
  0
ENDTAB
  0
TABLE
  2
LAYER
 70
3
  0
LAYER
  2
0
 70
0
 62
7
  6
CONTINUOUS
  0
LAYER
  2
A3D
 70
0
 62
230
  6
CONTINUOUS
  0
LAYER
  2
A3D
 70
0
 62
7
  6
CONTINUOUS
  0
ENDTAB
  0
TABLE
  2
STYLE
 70
0
  0
ENDTAB
 0
TABLE
  2
VPORT
  70
1
 0
VPORT
 2
*ACTIVE
 70
0
 10
0.0
 20
0.0
 11
1.0
 21
1.0
 12
${-size.x / 2}
 22     
${0}
 13
0.0
 23
0.0
 14
1.0
 24
1.0
 15
0.0
 25
0.0
 16
0
 26
0
 36
1
 17     
${center.x}
 27     
${center.y}
 37    
0
 40
${size.y}
 41
${size.x / size.y}
 42
50.0
 43
0.0
 44
0.0
 50
0.0
 51
0.0
 71
0
 72
0
 73
0
 74
0
 75
0
 76
0
 77
0
 78
0
  0
ENDTAB
  0
ENDSEC
  0
SECTION
  2
BLOCKS
  0
BLOCK
  8
A3D
  2
A3D_Group
  70
64
  10
0.0
  20
0.0
  30
0.0
  3
A3D_Group
`;

export const dxfFooter = `  0
ENDBLK
  0
ENDSEC
  0
SECTION
  2
ENTITIES
  0
INSERT
  8
A3D
  6
CONTINUOUS
 10
0.0
 20
0.0
 30
0.0
  2
A3D_Group
  0
ENDSEC
  0
EOF
`;
