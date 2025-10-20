import { Scene, vec3Zero, Group, Vec3, vec3TransRot, vec3RotCombine, Cylinder, Material, Plane, Box, Vec2, vec3, vec3Scale, vec3Add, vec3Sub, vec3Rot } from "../../abstract-3d.js";
import {
  MutableStep,
  GEOMETRIC_REPRESENTATION_CONTEXT_3D,
  LENGTH_UNIT,
  NAMED_UNIT,
  UNCERTAINTY_MEASURE_WITH_UNIT,
  GEOMETRIC_REPRESENTATION_CONTEXT_2D,
  HEADER,
  ENDSEC,
  APPLICATION_CONTEXT,
  APPLICATION_PROTOCOL_DEFINITION,
} from "./step-encoding.js";
import { stepBox, stepBox2, } from "./step-geometries/step-box.js";
import { stepCylinder } from "./step-geometries/step-cylinder.js";
import { stepPlane } from "./step-geometries/step-plane.js";

export const toStep = (scene: Scene): string => {

  const scene2: Scene = {
    size_deprecated: vec3(100, 100, 100),
    groups: [
      {
        pos: vec3(0, 0, 0),
        rot: vec3(Math.PI / 4, 0, 0),
        meshes: [
          {
            geometry: {
              type: "Box",
              pos: vec3(0, 0, 0),
              size: vec3(10, 4, 10),
            },
            material: {
              normal: "rgba(18, 35, 212, 1)",
              opacity: 0.5,
            }
          }
        ]
      }
    ]
  };

  const m: MutableStep = { refs: new Map<string, number>([]), step: "", geoContext3d: 7 };
  const applicationContext = APPLICATION_CONTEXT(m);
  APPLICATION_PROTOCOL_DEFINITION(applicationContext, m);

  const lengthUnit = LENGTH_UNIT(m);
  const uncertainty = UNCERTAINTY_MEASURE_WITH_UNIT(lengthUnit, m);
  const context3D = GEOMETRIC_REPRESENTATION_CONTEXT_3D(
    // 1
    lengthUnit,
    NAMED_UNIT("PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.)", m),
    NAMED_UNIT("SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT()", m),
    uncertainty,
    m
  );
  if(context3D !== m.geoContext3d) {
    throw Error("Context 3d is not correct");
  }

  for (const g of scene.groups) {
    stepGroup(g, scene.center_deprecated ?? vec3Zero, scene.rotation_deprecated ?? vec3Zero, m);
  }
  
  return `${HEADER()}${m.step}${ENDSEC()}`;
};

function stepGroup(g: Group, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {

  const pos = vec3TransRot(g.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, g.rot ?? vec3Zero);
  for (const mesh of g.meshes ?? []) {
    switch (mesh.geometry.type) {
      case "Box":
        stepBox2(mesh.geometry, mesh.material, pos, rot, m);
        break;
      case "Plane": {
        //convert it into a box
        const box: Box = {
          type: "Box",
          pos: mesh.geometry.pos,
          rot: mesh.geometry.rot,
          holes: mesh.geometry.holes,
          size: vec3(mesh.geometry.size.x, mesh.geometry.size.y, 0.01),
        };
        stepBox2(box, mesh.material, pos, rot, m);
        break;
      }
      case "Cylinder":
        stepCylinder(mesh.geometry, mesh.material, pos, rot, m);
        break;
      default:
        break;
    }
  }

  for (const c of g.groups ?? []) {
    stepGroup(c, pos, rot, m);
  }
}

function test(): string {
  const rot: Vec3 = vec3(-Math.PI / 3.14, Math.PI / 4, 0);
  const color: Vec3 = vec3(255.0, 0.0, 0.0);
  const size: Vec3 = vec3(5, 4, 3);
  const half = vec3Scale(size, 0.5);

  const corners = [
    vec3(0, 0, 0),
    vec3(0, 0, size.z),
    vec3(0, size.y, 0),
    vec3(0, size.y, size.z),
    vec3(size.x, 0, 0),
    vec3(size.x, 0, size.z),
    vec3(size.x, size.y, 0),
    vec3(size.x, size.y, size.z),
  ].map((v) => {
    const translated = vec3Sub(v, half);
    const rotated = vec3Rot(translated, vec3Zero, rot);
    return vec3Add(rotated, half);
  });

  const vec = (vec: Vec3 | undefined): string =>
    `${vec!.x.toFixed(6)},${vec!.y.toFixed(6)},${vec!.z.toFixed(6)}`;

  return `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('FreeCAD Model'),'2;1');
FILE_NAME('Open CASCADE Shape Model','2025-02-21T14:11:54',('Author'),(
    ''),'Open CASCADE STEP processor 7.8','FreeCAD','Unknown');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 1 }'));
ENDSEC;
DATA;
#1 = APPLICATION_PROTOCOL_DEFINITION('international standard',
  'automotive_design',2000,#2);
#2 = APPLICATION_CONTEXT(
  'core data for automotive mechanical design processes');
#3 = SHAPE_DEFINITION_REPRESENTATION(#4,#10);
#4 = PRODUCT_DEFINITION_SHAPE('','',#5);
#5 = PRODUCT_DEFINITION('design','',#6,#9);
#6 = PRODUCT_DEFINITION_FORMATION('','',#7);
#7 = PRODUCT('Cube','Cube','',(#8));
#8 = PRODUCT_CONTEXT('',#2,'mechanical');
#9 = PRODUCT_DEFINITION_CONTEXT('part definition',#2,'design');
#10 = ADVANCED_BREP_SHAPE_REPRESENTATION('',(#11,#15),#165);
#11 = AXIS2_PLACEMENT_3D('',#12,#13,#14);
#12 = CARTESIAN_POINT('',(${vec(corners[0])}));
#13 = DIRECTION('',(${vec(vec3Rot(vec3(0, 0, 1), vec3Zero, rot))}));
#14 = DIRECTION('',(${vec(vec3Rot(vec3(1, 0, 0), vec3Zero, rot))}));
#15 = MANIFOLD_SOLID_BREP('',#16);
#16 = CLOSED_SHELL('',(#17,#57,#97,#119,#141,#153));
#17 = ADVANCED_FACE('',(#18),#52,.F.);
#18 = FACE_BOUND('',#19,.F.);
#19 = EDGE_LOOP('',(#20,#30,#38,#46));
#20 = ORIENTED_EDGE('',*,*,#21,.F.); 
#21 = EDGE_CURVE('',#22,#24,#26,.T.);
#22 = VERTEX_POINT('',#23);
#23 = CARTESIAN_POINT('',(${vec(corners[0])}));
#24 = VERTEX_POINT('',#25);
#25 = CARTESIAN_POINT('',(${vec(corners[1])}));
#26 = LINE('',#27,#28);
#27 = CARTESIAN_POINT('',(${vec(corners[0])}));
#28 = VECTOR('',#29,1.);
#29 = DIRECTION('',(${vec(vec3Rot(vec3(0, 0, 1), vec3Zero, rot))}));
#30 = ORIENTED_EDGE('',*,*,#31,.T.);
#31 = EDGE_CURVE('',#22,#32,#34,.T.);
#32 = VERTEX_POINT('',#33);
#33 = CARTESIAN_POINT('',(${vec(corners[2])}));
#34 = LINE('',#35,#36);
#35 = CARTESIAN_POINT('',(${vec(corners[0])}));
#36 = VECTOR('',#37,1.);
#37 = DIRECTION('',(${vec(vec3Rot(vec3(0, 1, 0), vec3Zero, rot))}));
#38 = ORIENTED_EDGE('',*,*,#39,.T.);
#39 = EDGE_CURVE('',#32,#40,#42,.T.);
#40 = VERTEX_POINT('',#41);
#41 = CARTESIAN_POINT('',(${vec(corners[3])}));
#42 = LINE('',#43,#44);
#43 = CARTESIAN_POINT('',(${vec(corners[2])}));
#44 = VECTOR('',#45,1.);
#45 = DIRECTION('',(${vec(vec3Rot(vec3(0, 0, 1), vec3Zero, rot))}));
#46 = ORIENTED_EDGE('',*,*,#47,.F.);
#47 = EDGE_CURVE('',#24,#40,#48,.T.);
#48 = LINE('',#49,#50);
#49 = CARTESIAN_POINT('',(${vec(corners[1])}));
#50 = VECTOR('',#51,1.);
#51 = DIRECTION('',(${vec(vec3Rot(vec3(0, 1, 0), vec3Zero, rot))}));
#52 = PLANE('',#53);
#53 = AXIS2_PLACEMENT_3D('',#54,#55,#56);
#54 = CARTESIAN_POINT('',(${vec(corners[0])}));
#55 = DIRECTION('',(${vec(vec3Rot(vec3(1, 0, 0), vec3Zero, rot))}));
#56 = DIRECTION('',(${vec(vec3Rot(vec3(0, 0, 1), vec3Zero, rot))}));
#57 = ADVANCED_FACE('',(#58),#92,.T.);
#58 = FACE_BOUND('',#59,.T.);
#59 = EDGE_LOOP('',(#60,#70,#78,#86));
#60 = ORIENTED_EDGE('',*,*,#61,.F.);
#61 = EDGE_CURVE('',#62,#64,#66,.T.);
#62 = VERTEX_POINT('',#63);
#63 = CARTESIAN_POINT('',(${vec(corners[4])}));
#64 = VERTEX_POINT('',#65);
#65 = CARTESIAN_POINT('',(${vec(corners[5])}));
#66 = LINE('',#67,#68);
#67 = CARTESIAN_POINT('',(${vec(corners[4])}));
#68 = VECTOR('',#69,1.);
#69 = DIRECTION('',(${vec(vec3Rot(vec3(0, 0, 1), vec3Zero, rot))}));
#70 = ORIENTED_EDGE('',*,*,#71,.T.);
#71 = EDGE_CURVE('',#62,#72,#74,.T.);
#72 = VERTEX_POINT('',#73);
#73 = CARTESIAN_POINT('',(${vec(corners[6])}));
#74 = LINE('',#75,#76);
#75 = CARTESIAN_POINT('',(${vec(corners[4])}));
#76 = VECTOR('',#77,1.);
#77 = DIRECTION('',(${vec(vec3Rot(vec3(0, 1, 0), vec3Zero, rot))}));
#78 = ORIENTED_EDGE('',*,*,#79,.T.);
#79 = EDGE_CURVE('',#72,#80,#82,.T.);
#80 = VERTEX_POINT('',#81);
#81 = CARTESIAN_POINT('',(${vec(corners[7])}));
#82 = LINE('',#83,#84);
#83 = CARTESIAN_POINT('',(${vec(corners[6])}));
#84 = VECTOR('',#85,1.);
#85 = DIRECTION('',(${vec(vec3Rot(vec3(0, 0, 1), vec3Zero, rot))}));
#86 = ORIENTED_EDGE('',*,*,#87,.F.);
#87 = EDGE_CURVE('',#64,#80,#88,.T.);
#88 = LINE('',#89,#90);
#89 = CARTESIAN_POINT('',(${vec(corners[5])}));
#90 = VECTOR('',#91,1.);
#91 = DIRECTION('',(${vec(vec3Rot(vec3(0, 1, 0), vec3Zero, rot))}));
#92 = PLANE('',#93);
#93 = AXIS2_PLACEMENT_3D('',#94,#95,#96);
#94 = CARTESIAN_POINT('',(${vec(corners[4])}));
#95 = DIRECTION('',(${vec(vec3Rot(vec3(1, 0, 0), vec3Zero, rot))}));
#96 = DIRECTION('',(${vec(vec3Rot(vec3(0, 0, 1), vec3Zero, rot))}));
#97 = ADVANCED_FACE('',(#98),#114,.F.);
#98 = FACE_BOUND('',#99,.F.);
#99 = EDGE_LOOP('',(#100,#106,#107,#113));
#100 = ORIENTED_EDGE('',*,*,#101,.F.);
#101 = EDGE_CURVE('',#22,#62,#102,.T.);
#102 = LINE('',#103,#104);
#103 = CARTESIAN_POINT('',(${vec(corners[0])}));
#104 = VECTOR('',#105,1.);
#105 = DIRECTION('',(${vec(vec3Rot(vec3(1, 0, 0), vec3Zero, rot))}));
#106 = ORIENTED_EDGE('',*,*,#21,.T.);
#107 = ORIENTED_EDGE('',*,*,#108,.T.);
#108 = EDGE_CURVE('',#24,#64,#109,.T.);
#109 = LINE('',#110,#111);
#110 = CARTESIAN_POINT('',(${vec(corners[1])}));
#111 = VECTOR('',#112,1.);
#112 = DIRECTION('',(${vec(vec3Rot(vec3(1, 0, 0), vec3Zero, rot))}));
#113 = ORIENTED_EDGE('',*,*,#61,.F.);
#114 = PLANE('',#115);
#115 = AXIS2_PLACEMENT_3D('',#116,#117,#118);
#116 = CARTESIAN_POINT('',(${vec(corners[0])}));
#117 = DIRECTION('',(${vec(vec3Rot(vec3(0, 1, 0), vec3Zero, rot))}));
#118 = DIRECTION('',(${vec(vec3Rot(vec3(0, 0, 1), vec3Zero, rot))}));
#119 = ADVANCED_FACE('',(#120),#136,.T.);
#120 = FACE_BOUND('',#121,.T.);
#121 = EDGE_LOOP('',(#122,#128,#129,#135));
#122 = ORIENTED_EDGE('',*,*,#123,.F.);
#123 = EDGE_CURVE('',#32,#72,#124,.T.);
#124 = LINE('',#125,#126);
#125 = CARTESIAN_POINT('',(${vec(corners[2])}));
#126 = VECTOR('',#127,1.);
#127 = DIRECTION('',(${vec(vec3Rot(vec3(1, 0, 0), vec3Zero, rot))}));
#128 = ORIENTED_EDGE('',*,*,#39,.T.);
#129 = ORIENTED_EDGE('',*,*,#130,.T.);
#130 = EDGE_CURVE('',#40,#80,#131,.T.);
#131 = LINE('',#132,#133);
#132 = CARTESIAN_POINT('',(${vec(corners[3])}));
#133 = VECTOR('',#134,1.);
#134 = DIRECTION('',(${vec(vec3Rot(vec3(1, 0, 0), vec3Zero, rot))}));
#135 = ORIENTED_EDGE('',*,*,#79,.F.);
#136 = PLANE('',#137);
#137 = AXIS2_PLACEMENT_3D('',#138,#139,#140);
#138 = CARTESIAN_POINT('',(${vec(corners[2])}));
#139 = DIRECTION('',(${vec(vec3Rot(vec3(0, 1, 0), vec3Zero, rot))}));
#140 = DIRECTION('',(${vec(vec3Rot(vec3(0, 0, 1), vec3Zero, rot))}));
#141 = ADVANCED_FACE('',(#142),#148,.F.);
#142 = FACE_BOUND('',#143,.F.);
#143 = EDGE_LOOP('',(#144,#145,#146,#147));
#144 = ORIENTED_EDGE('',*,*,#31,.F.);
#145 = ORIENTED_EDGE('',*,*,#101,.T.);
#146 = ORIENTED_EDGE('',*,*,#71,.T.);
#147 = ORIENTED_EDGE('',*,*,#123,.F.);
#148 = PLANE('',#149);
#149 = AXIS2_PLACEMENT_3D('',#150,#151,#152);
#150 = CARTESIAN_POINT('',(${vec(corners[0])}));
#151 = DIRECTION('',(${vec(vec3Rot(vec3(0, 0, 1), vec3Zero, rot))}));
#152 = DIRECTION('',(${vec(vec3Rot(vec3(1, 0, 0), vec3Zero, rot))}));
#153 = ADVANCED_FACE('',(#154),#160,.T.);
#154 = FACE_BOUND('',#155,.T.);
#155 = EDGE_LOOP('',(#156,#157,#158,#159));
#156 = ORIENTED_EDGE('',*,*,#47,.F.);
#157 = ORIENTED_EDGE('',*,*,#108,.T.);
#158 = ORIENTED_EDGE('',*,*,#87,.T.);
#159 = ORIENTED_EDGE('',*,*,#130,.F.);
#160 = PLANE('',#161);
#161 = AXIS2_PLACEMENT_3D('',#162,#163,#164);
#162 = CARTESIAN_POINT('',(${vec(corners[1])}));
#163 = DIRECTION('',(${vec(vec3Rot(vec3(0, 0, 1), vec3Zero, rot))}));
#164 = DIRECTION('',(${vec(vec3Rot(vec3(1, 0, 0), vec3Zero, rot))}));
#165 = ( GEOMETRIC_REPRESENTATION_CONTEXT(3) 
GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#169)) GLOBAL_UNIT_ASSIGNED_CONTEXT
((#166,#167,#168)) REPRESENTATION_CONTEXT('Context #1',
  '3D Context with UNIT and UNCERTAINTY') );
#166 = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );
#167 = ( NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.) );
#168 = ( NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT() );
#169 = UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-07),#166,
  'distance_accuracy_value','confusion accuracy');
#170 = PRODUCT_RELATED_PRODUCT_CATEGORY('part',$,(#7));
#171 = MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION('',(#172)
  ,#165);
#172 = STYLED_ITEM('color',(#173),#15);
#173 = PRESENTATION_STYLE_ASSIGNMENT((#174,#180));
#174 = SURFACE_STYLE_USAGE(.BOTH.,#175);
#175 = SURFACE_SIDE_STYLE('',(#176));
#176 = SURFACE_STYLE_FILL_AREA(#177);
#177 = FILL_AREA_STYLE('',(#178));
#178 = FILL_AREA_STYLE_COLOUR('',#179);
#179 = COLOUR_RGB('',${vec(color)});
#180 = CURVE_STYLE('',#181,POSITIVE_LENGTH_MEASURE(0.1),#182);
#181 = DRAUGHTING_PRE_DEFINED_CURVE_FONT('continuous');
#182 = COLOUR_RGB('',0,0,0);
ENDSEC;
END-ISO-10303-21;
`
}

