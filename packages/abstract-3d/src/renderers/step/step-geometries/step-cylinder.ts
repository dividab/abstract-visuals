import { Euler, Matrix4, Vector3 } from "three";
import {
  Plane,
  Material,
  Vec3,
  vec2Scale,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
  vec3,
  vec3PosX,
  vec3PosZ,
  Cylinder,
  vec2Zero,
  vec2,
  vec3NegX,
  vec3NegY,
  vec3NegZ,
  vec3PosY,
  vec3Normalize,
  vec3Scale,
} from "../../../abstract-3d.js";
import { parseRgb } from "../../shared.js";
import {
  ADVANCED_BREP_SHAPE_REPRESENTATION,
  ADVANCED_FACE,
  AXIS2_PLACEMENT_3D,
  CARTESIAN_POINT,
  CIRCLE,
  CLOSED_SHELL,
  COLOUR_RGB,
  CURVE_STYLE,
  CYLINDRICAL_SURFACE,
  DEFINITIONAL_REPRESENTATION,
  DIRECTION,
  DRAUGHTING_PRE_DEFINED_CURVE_FONT,
  EDGE_CURVE,
  EDGE_LOOP,
  FACE_BOUND,
  FILL_AREA_STYLE_COLOUR,
  LINE,
  MANIFOLD_SOLID_BREP,
  MANIFOLD_SURFACE_SHAPE_REPRESENTATION,
  MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION,
  MutableStep,
  OPEN_SHELL,
  ORIENTED_EDGE,
  PCURVE,
  PLANE,
  PRESENTATION_STYLE_ASSIGNMENT,
  SEAM_CURVE,
  SHELL_BASED_SURFACE_MODEL,
  STYLED_ITEM,
  SURFACE_CURVE,
  SURFACE_SIDE_STYLE,
  SURFACE_STYLE_FILL_AREA,
  SURFACE_STYLE_USAGE,
  VECTOR,
  VERTEX_POINT,
} from "../step-encoding.js";

function str(num: number): string {
  return num.toFixed(20).replace(/(\.[0-9]*[1-9])0+$|0*$/, '$1');
}

/*export function stepCylinderTest(c: Cylinder, mat: Material, rot: Vec3): void {
  const r = c.radius;
  const h = c.length;
  const rgb = parseRgb(mat.normal);
  const pos = vec3TransRot(c.pos, vec3Zero, vec3Zero);
  const rotation = vec3RotCombine(vec3Zero, rot);
  
  const rotationMatrix = new Matrix4();
  const euler = new Euler();
  euler.set(rot.x, rot.y, rot.z);
  rotationMatrix.makeRotationFromEuler(euler);

  const upNormal = new Vector3();
  const downNormal = new Vector3();
  upNormal.set(0, 1, 0);
  downNormal.set(0, -1, 0);

  upNormal.applyMatrix4(rotationMatrix);
  downNormal.applyMatrix4(rotationMatrix);

  const circleTop = new Vector3();
  circleTop.set(0,  h / 2, 0);
  circleTop.applyMatrix4(rotationMatrix);

  const circleBot = new Vector3();
  circleBot.set(0,  -h / 2, 0);
  circleBot.applyMatrix4(rotationMatrix);

  console.log("Normal: ", upNormal, "; Down Normal: ", downNormal);

  const v1 = new Vector3();
  const v2 = new Vector3();
  v1.set(r, h / 2, 0);
  v2.set(r, -h / 2, 0);
  v1.applyMatrix4(rotationMatrix);
  v2.applyMatrix4(rotationMatrix);

  const cyl = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('FreeCAD Model'),'2;1');
FILE_NAME('Open CASCADE Shape Model','2025-02-24T08:43:34',(''),(''),
  'Open CASCADE STEP processor 7.8','FreeCAD','Unknown');
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
#7 = PRODUCT('Cylinder','Cylinder','',(#8));
#8 = PRODUCT_CONTEXT('',#2,'mechanical');
#9 = PRODUCT_DEFINITION_CONTEXT('part definition',#2,'design');
#10 = ADVANCED_BREP_SHAPE_REPRESENTATION('',(#11,#15),#68);
#11 = AXIS2_PLACEMENT_3D('',#12,#13,#14);
#12 = CARTESIAN_POINT('',(0.,0.,0.));
#13 = DIRECTION('',(0.,0.,1.));
#14 = DIRECTION('',(1.,0.,0.));
#15 = MANIFOLD_SOLID_BREP('',#16);
#16 = CLOSED_SHELL('',(#17,#50,#59));
#17 = ADVANCED_FACE('',(#18),#45,.T.);
#18 = FACE_BOUND('',#19,.F.);
#19 = EDGE_LOOP('',(#20,#30,#37,#38));
#20 = ORIENTED_EDGE('',*,*,#21,.T.);
#21 = EDGE_CURVE('',#22,#24,#26,.T.);
#22 = VERTEX_POINT('',#23);
#23 = CARTESIAN_POINT('',(${str(pos.x + v2.x)},${str(pos.y + v2.y)},${str(pos.z + v2.z)})); 
#24 = VERTEX_POINT('',#25);
#25 = CARTESIAN_POINT('',(${str(pos.x + v1.x)},${str(pos.y + v1.y)},${str(pos.z + v1.z)}));
#26 = LINE('',#27,#28);
#27 = CARTESIAN_POINT('',(${str(pos.x + v2.x)},${str(pos.y + v2.y)},${str(pos.z + v2.z)}));
#28 = VECTOR('',#29,1.);
#29 = DIRECTION('',(0.,0.,1.));
#30 = ORIENTED_EDGE('',*,*,#31,.T.);
#31 = EDGE_CURVE('',#24,#24,#32,.T.);
#32 = CIRCLE('',#33,${str(r)});
#33 = AXIS2_PLACEMENT_3D('',#34,#35,#36);
#34 = CARTESIAN_POINT('',(${str(pos.x + circleTop.x)},${str(pos.y + circleTop.y)},${str(pos.z + circleTop.z)}));
#35 = DIRECTION('',(${upNormal.x},${upNormal.y},${upNormal.z}));
#36 = DIRECTION('',(0.,1.,0.));
#37 = ORIENTED_EDGE('',*,*,#21,.F.);
#38 = ORIENTED_EDGE('',*,*,#39,.F.);
#39 = EDGE_CURVE('',#22,#22,#40,.T.);
#40 = CIRCLE('',#41,${str(r)});
#41 = AXIS2_PLACEMENT_3D('',#42,#43,#44);
#42 = CARTESIAN_POINT('',(${str(pos.x + circleBot.x)},${str(pos.y + circleBot.y)},${str(pos.z + circleBot.z)}));
#43 = DIRECTION('',(${upNormal.x},${upNormal.y},${upNormal.z}));
#44 = DIRECTION('',(0.,1.,0.));
#45 = CYLINDRICAL_SURFACE('',#46,${str(r)});
#46 = AXIS2_PLACEMENT_3D('',#47,#48,#49);
#47 = CARTESIAN_POINT('',(${str(pos.x + circleTop.x)},${str(pos.y + circleTop.y)},${str(pos.z + circleTop.z)}));
#48 = DIRECTION('',(${downNormal.x},${downNormal.y},${downNormal.z}));
#49 = DIRECTION('',(0.,1.,0.));
#50 = ADVANCED_FACE('',(#51),#54,.F.);
#51 = FACE_BOUND('',#52,.T.);
#52 = EDGE_LOOP('',(#53));
#53 = ORIENTED_EDGE('',*,*,#39,.F.);
#54 = PLANE('',#55);
#55 = AXIS2_PLACEMENT_3D('',#56,#57,#58);
#56 = CARTESIAN_POINT('',(${str(pos.x + circleBot.x)},${str(pos.y + circleBot.y)},${str(pos.z + circleBot.z)}));
#57 = DIRECTION('',(${upNormal.x},${upNormal.y},${upNormal.z}));
#58 = DIRECTION('',(0.,1.,0.));
#59 = ADVANCED_FACE('',(#60),#63,.T.);
#60 = FACE_BOUND('',#61,.F.);
#61 = EDGE_LOOP('',(#62));
#62 = ORIENTED_EDGE('',*,*,#31,.F.);
#63 = PLANE('',#64);
#64 = AXIS2_PLACEMENT_3D('',#65,#66,#67);
#65 = CARTESIAN_POINT('',(${str(pos.x + circleTop.x)},${str(pos.y + circleTop.y)},${str(pos.z + circleTop.z)}));
#66 = DIRECTION('',(${upNormal.x},${upNormal.y},${upNormal.z}));
#67 = DIRECTION('',(0.,1.,0.));
#68 = ( GEOMETRIC_REPRESENTATION_CONTEXT(3) 
GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#72)) GLOBAL_UNIT_ASSIGNED_CONTEXT(
(#69,#70,#71)) REPRESENTATION_CONTEXT('Context #1',
  '3D Context with UNIT and UNCERTAINTY') );
#69 = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );
#70 = ( NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.) );
#71 = ( NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT() );
#72 = UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-07),#69,
  'distance_accuracy_value','confusion accuracy');
#73 = PRODUCT_RELATED_PRODUCT_CATEGORY('part',$,(#7));
#74 = MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION('',(#75),
  #68);
#75 = STYLED_ITEM('color',(#76),#15);
#76 = PRESENTATION_STYLE_ASSIGNMENT((#77,#83));
#77 = SURFACE_STYLE_USAGE(.BOTH.,#78);
#78 = SURFACE_SIDE_STYLE('',(#79));
#79 = SURFACE_STYLE_FILL_AREA(#80);
#80 = FILL_AREA_STYLE('',(#81));
#81 = FILL_AREA_STYLE_COLOUR('',#82);
#82 = COLOUR_RGB('',${str(rgb.r)},${str(rgb.g)},${str(rgb.b)});
#83 = CURVE_STYLE('',#84,POSITIVE_LENGTH_MEASURE(0.1),#85);
#84 = DRAUGHTING_PRE_DEFINED_CURVE_FONT('continuous');
#85 = COLOUR_RGB('',${str(rgb.r)},${str(rgb.g)},${str(rgb.b)});
ENDSEC;
END-ISO-10303-21;`;

  console.log(cyl);
}*/

export function stepCylinder2(c: Cylinder, mat: Material, parentPos: Vec3, parentRot: Vec3, startIndex: number): string {

  const i = startIndex - 2;

  const r = c.radius;
  const h = c.length;
  const rgb = parseRgb(mat.normal);
  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rotation = vec3RotCombine(parentRot, c.rot ?? vec3Zero);
  
  const rotationMatrix = new Matrix4();
  const euler = new Euler();
  euler.set(rotation.x, rotation.y, rotation.z);
  rotationMatrix.makeRotationFromEuler(euler);

  const upNormal = new Vector3();
  const downNormal = new Vector3();
  upNormal.set(0, 1, 0);
  downNormal.set(0, -1, 0);

  upNormal.applyMatrix4(rotationMatrix);
  downNormal.applyMatrix4(rotationMatrix);

  const circleTop = new Vector3();
  circleTop.set(0,  h / 2, 0);
  circleTop.applyMatrix4(rotationMatrix);

  const circleBot = new Vector3();
  circleBot.set(0,  -h / 2, 0);
  circleBot.applyMatrix4(rotationMatrix);

  const v1 = new Vector3();
  const v2 = new Vector3();
  v1.set(r, h / 2, 0);
  v2.set(r, -h / 2, 0);
  v1.applyMatrix4(rotationMatrix);
  v2.applyMatrix4(rotationMatrix);

  const cyl = `#${i+3} = SHAPE_DEFINITION_REPRESENTATION(#${i+4},#${i+10});
#${i+4} = PRODUCT_DEFINITION_SHAPE('','',#${i+5});
#${i+5} = PRODUCT_DEFINITION('design','',#${i+6},#${i+9});
#${i+6} = PRODUCT_DEFINITION_FORMATION('','',#${i+7});
#${i+7} = PRODUCT('Cylinder','Cylinder','',(#${i+8}));
#${i+8} = PRODUCT_CONTEXT('',#${i+2},'mechanical');
#${i+9} = PRODUCT_DEFINITION_CONTEXT('part definition',#${i+2},'design');
#${i+10} = ADVANCED_BREP_SHAPE_REPRESENTATION('',(#${i+11},#${i+15}),#${i+68});
#${i+11} = AXIS2_PLACEMENT_3D('',#${i+12},#${i+13},#${i+14});
#${i+12} = CARTESIAN_POINT('',(0.,0.,0.));
#${i+13} = DIRECTION('',(0.,0.,1.));
#${i+14} = DIRECTION('',(1.,0.,0.));
#${i+15} = MANIFOLD_SOLID_BREP('',#${i+16});
#${i+16} = CLOSED_SHELL('',(#${i+17},#${i+50},#${i+59}));
#${i+17} = ADVANCED_FACE('',(#${i+18}),#${i+45},.T.);
#${i+18} = FACE_BOUND('',#${i+19},.F.);
#${i+19} = EDGE_LOOP('',(#${i+20},#${i+30},#${i+37},#${i+38}));
#${i+20} = ORIENTED_EDGE('',*,*,#${i+21},.T.);
#${i+21} = EDGE_CURVE('',#${i+22},#${i+24},#${i+26},.T.);
#${i+22} = VERTEX_POINT('',#${i+23});
#${i+23} = CARTESIAN_POINT('',(${str(pos.x + v2.x)},${str(pos.y + v2.y)},${str(pos.z + v2.z)})); 
#${i+24} = VERTEX_POINT('',#${i+25});
#${i+25} = CARTESIAN_POINT('',(${str(pos.x + v1.x)},${str(pos.y + v1.y)},${str(pos.z + v1.z)}));
#${i+26} = LINE('',#${i+27},#${i+28});
#${i+27} = CARTESIAN_POINT('',(${str(pos.x + v2.x)},${str(pos.y + v2.y)},${str(pos.z + v2.z)}));
#${i+28} = VECTOR('',#${i+29},1.);
#${i+29} = DIRECTION('',(${upNormal.x},${upNormal.y},${upNormal.z}));
#${i+30} = ORIENTED_EDGE('',*,*,#${i+31},.T.);
#${i+31} = EDGE_CURVE('',#${i+24},#${i+24},#${i+32},.T.);
#${i+32} = CIRCLE('',#${i+33},${str(r)});
#${i+33} = AXIS2_PLACEMENT_3D('',#${i+34},#${i+35},#${i+36});
#${i+34} = CARTESIAN_POINT('',(${str(pos.x + circleTop.x)},${str(pos.y + circleTop.y)},${str(pos.z + circleTop.z)}));
#${i+35} = DIRECTION('',(${upNormal.x},${upNormal.y},${upNormal.z}));
#${i+36} = DIRECTION('',(0.,1.,0.));
#${i+37} = ORIENTED_EDGE('',*,*,#${i+21},.F.);
#${i+38} = ORIENTED_EDGE('',*,*,#${i+39},.F.);
#${i+39} = EDGE_CURVE('',#${i+22},#${i+22},#${i+40},.T.);
#${i+40} = CIRCLE('',#${i+41},${str(r)});
#${i+41} = AXIS2_PLACEMENT_3D('',#${i+42},#${i+43},#${i+44});
#${i+42} = CARTESIAN_POINT('',(${str(pos.x + circleBot.x)},${str(pos.y + circleBot.y)},${str(pos.z + circleBot.z)}));
#${i+43} = DIRECTION('',(${upNormal.x},${upNormal.y},${upNormal.z}));
#${i+44} = DIRECTION('',(0.,1.,0.));
#${i+45} = CYLINDRICAL_SURFACE('',#${i+46},${str(r)});
#${i+46} = AXIS2_PLACEMENT_3D('',#${i+47},#${i+48},#${i+49});
#${i+47} = CARTESIAN_POINT('',(${str(pos.x + circleTop.x)},${str(pos.y + circleTop.y)},${str(pos.z + circleTop.z)}));
#${i+48} = DIRECTION('',(${downNormal.x},${downNormal.y},${downNormal.z}));
#${i+49} = DIRECTION('',(0.,-1.,0.));
#${i+50} = ADVANCED_FACE('',(#${i+51}),#${i+54},.F.);
#${i+51} = FACE_BOUND('',#${i+52},.T.);
#${i+52} = EDGE_LOOP('',(#${i+53}));
#${i+53} = ORIENTED_EDGE('',*,*,#${i+39},.F.);
#${i+54} = PLANE('',#${i+55});
#${i+55} = AXIS2_PLACEMENT_3D('',#${i+56},#${i+57},#${i+58});
#${i+56} = CARTESIAN_POINT('',(${str(pos.x + circleBot.x)},${str(pos.y + circleBot.y)},${str(pos.z + circleBot.z)}));
#${i+57} = DIRECTION('',(${upNormal.x},${upNormal.y},${upNormal.z}));
#${i+58} = DIRECTION('',(0.,1.,0.));
#${i+59} = ADVANCED_FACE('',(#${i+60}),#${i+63},.T.);
#${i+60} = FACE_BOUND('',#${i+61},.F.);
#${i+61} = EDGE_LOOP('',(#${i+62}));
#${i+62} = ORIENTED_EDGE('',*,*,#${i+31},.F.);
#${i+63} = PLANE('',#${i+64});
#${i+64} = AXIS2_PLACEMENT_3D('',#${i+65},#${i+66},#${i+67});
#${i+65} = CARTESIAN_POINT('',(${str(pos.x + circleTop.x)},${str(pos.y + circleTop.y)},${str(pos.z + circleTop.z)}));
#${i+66} = DIRECTION('',(${upNormal.x},${upNormal.y},${upNormal.z}));
#${i+67} = DIRECTION('',(0.,1.,0.));
#${i+68} = ( GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT( (#${i+72})) GLOBAL_UNIT_ASSIGNED_CONTEXT((#${i+69},#${i+70},#${i+71})) REPRESENTATION_CONTEXT('Context #${i+1}', '3D Context with UNIT and UNCERTAINTY') );
#${i+69} = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );
#${i+70} = ( NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.) );
#${i+71} = ( NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT() );
#${i+72} = UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-07),#${i+69}, 'distance_accuracy_value','confusion accuracy');
#${i+73} = PRODUCT_RELATED_PRODUCT_CATEGORY('part',$,(#${i+7}));
#${i+74} = MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION('',(#${i+75}), #${i+68});
#${i+75} = STYLED_ITEM('color',(#${i+76}),#${i+15});
#${i+76} = PRESENTATION_STYLE_ASSIGNMENT((#${i+77},#${i+83}));
#${i+77} = SURFACE_STYLE_USAGE(.BOTH.,#${i+78});
#${i+78} = SURFACE_SIDE_STYLE('',(#${i+79}));
#${i+79} = SURFACE_STYLE_FILL_AREA(#${i+80});
#${i+80} = FILL_AREA_STYLE('',(#${i+81}));
#${i+81} = FILL_AREA_STYLE_COLOUR('',#${i+82});
#${i+82} = COLOUR_RGB('',${str(rgb.r)},${str(rgb.g)},${str(rgb.b)});
#${i+83} = CURVE_STYLE('',#${i+84},POSITIVE_LENGTH_MEASURE(0.1),#${i+85});
#${i+84} = DRAUGHTING_PRE_DEFINED_CURVE_FONT('continuous');
#${i+85} = COLOUR_RGB('',${str(rgb.r)},${str(rgb.g)},${str(rgb.b)});
`;

  return cyl;
}

export function stepCylinder(c: Cylinder, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, c.rot ?? vec3Zero);
  const cart3tr = (x: number, y: number): number => CARTESIAN_POINT(vec3TransRot(vec3(x, y, 0), pos, rot), m);
  const v0 = VECTOR(DIRECTION(vec3Zero, m), m);
  const c03 = CARTESIAN_POINT(vec3Zero, m);
  const c02 = CARTESIAN_POINT(vec2Zero, m);
  const [d1, d2] = [DIRECTION(vec3RotCombine(vec3PosX, rot), m), DIRECTION(vec3RotCombine(vec3PosY, rot), m)];
  const [d3, d4] = [DIRECTION(vec3RotCombine(vec3PosZ, rot), m), DIRECTION(vec3RotCombine(vec3NegX, rot), m)];
  const [d5, d6] = [DIRECTION(vec3RotCombine(vec3NegY, rot), m), DIRECTION(vec3RotCombine(vec3NegZ, rot), m)];
  const [down, up] = [AXIS2_PLACEMENT_3D(c03, d5, d4, m), AXIS2_PLACEMENT_3D(c03, d2, d1, m)];
  const [c1, c2] = [cart3tr(-c.radius, -c.length / 2), cart3tr(c.radius, -c.length / 2)];
  const [c3, c4] = [cart3tr(c.radius, c.length / 2), cart3tr(-c.radius, c.length / 2)];
  const [v1, v2, v3, v4] = [VERTEX_POINT(c1, m), VERTEX_POINT(c2, m), VERTEX_POINT(c3, m), VERTEX_POINT(c4, m)];
  const [l1, l2, l3, l4] = [LINE(c1, v0, m), LINE(c2, v0, m), LINE(c3, v0, m), LINE(c4, v0, m)];

  const [oe1, oe2, oe3, oe4] = [
    ORIENTED_EDGE(
      EDGE_CURVE(
        v1,
        v2,
        SEAM_CURVE(
          LINE(c2, v0, m),
          PCURVE(
            CYLINDRICAL_SURFACE(down, m),
            DEFINITIONAL_REPRESENTATION(LINE(c02, VECTOR(DIRECTION(vec2(-1, 0), m), m), m), m),
            m
          ),
          PCURVE(
            CYLINDRICAL_SURFACE(down, m),
            DEFINITIONAL_REPRESENTATION(LINE(c02, VECTOR(DIRECTION(vec2(-1, 0), m), m), m), m),
            m
          ),
          m
        ),
        m
      ),
      m
    ),
    ORIENTED_EDGE(
      EDGE_CURVE(
        v1,
        v2,
        SEAM_CURVE(
          LINE(c2, v0, m),
          PCURVE(
            CYLINDRICAL_SURFACE(down, m),
            DEFINITIONAL_REPRESENTATION(LINE(c02, VECTOR(DIRECTION(vec2(-1, 0), m), m), m), m),
            m
          ),
          PCURVE(
            CYLINDRICAL_SURFACE(down, m),
            DEFINITIONAL_REPRESENTATION(LINE(c02, VECTOR(DIRECTION(vec2(-1, 0), m), m), m), m),
            m
          ),
          m
        ),
        m
      ),
      m
    ),
    ORIENTED_EDGE(
      EDGE_CURVE(
        v2,
        v2,
        SURFACE_CURVE(
          CIRCLE(down, m),
          PCURVE(
            CYLINDRICAL_SURFACE(down, m),
            DEFINITIONAL_REPRESENTATION(LINE(c02, VECTOR(DIRECTION(vec2(-1, 0), m), m), m), m),
            m
          ),
          PCURVE(down, DEFINITIONAL_REPRESENTATION(CIRCLE(up, m), m), m),
          m
        ),
        m
      ),
      m
    ), // Bottom  circle edge curve
    ORIENTED_EDGE(
      EDGE_CURVE(
        v3,
        v3,
        SURFACE_CURVE(
          CIRCLE(down, m),
          PCURVE(
            CYLINDRICAL_SURFACE(down, m),
            DEFINITIONAL_REPRESENTATION(LINE(c02, VECTOR(DIRECTION(vec2(-1, 0), m), m), m), m),
            m
          ),
          PCURVE(down, DEFINITIONAL_REPRESENTATION(CIRCLE(up, m), m), m),
          m
        ),
        m
      ),
      m
    ), // Top circle edge curve
  ];

  const color = COLOUR_RGB(parseRgb(mat.normal), m);
  const msb = MANIFOLD_SOLID_BREP(
    CLOSED_SHELL(
      [
        ADVANCED_FACE(
          FACE_BOUND(EDGE_LOOP([oe1, oe2, oe3, oe4], m), "F", m),
          PCURVE(
            CYLINDRICAL_SURFACE(down, m),
            DEFINITIONAL_REPRESENTATION(LINE(c02, VECTOR(DIRECTION(vec2(-1, 0), m), m), m), m),
            m
          ),
          m
        ),
        ADVANCED_FACE(FACE_BOUND(EDGE_LOOP([oe3], m), "T", m), PLANE(down, m), m), // Circle down
        ADVANCED_FACE(FACE_BOUND(EDGE_LOOP([oe4], m), "F", m), PLANE(up, m), m), // Circle up
      ],
      m
    ),
    m
  );
  ADVANCED_BREP_SHAPE_REPRESENTATION(
    AXIS2_PLACEMENT_3D(c03, DIRECTION(vec3PosZ, m), DIRECTION(vec3PosX, m), m),
    msb,
    m
  );
  MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION(
    STYLED_ITEM(
      PRESENTATION_STYLE_ASSIGNMENT(
        SURFACE_STYLE_USAGE(SURFACE_SIDE_STYLE(SURFACE_STYLE_FILL_AREA(FILL_AREA_STYLE_COLOUR(color, m), m), m), m),
        CURVE_STYLE(DRAUGHTING_PRE_DEFINED_CURVE_FONT("continuous", m), color, m),
        m
      ),
      msb,
      m
    ),
    m
  );
}
