/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
/* eslint-disable functional/prefer-readonly-type */
import React from "react";
// import { Text } from "@react-three/drei/core/Text";
// import { Line } from "@react-three/drei/core/Line";
import { Text, Line } from "@react-three/drei";
import {
  BoxGeometry,
  CylinderGeometry,
  ConeGeometry,
  PlaneGeometry,
  Shape,
  Path,
  ExtrudeGeometry,
  Vector3,
  Euler,
  Quaternion,
  TubeGeometry,
  CatmullRomCurve3,
  Curve,
  BufferAttribute,
  SphereGeometry,
} from "three";
import { exhaustiveCheck } from "ts-exhaustive-check";
import * as A3d from "../../abstract-3d";
import { Hole } from "../../abstract-3d";

const boxGeometry = new BoxGeometry();
const cylinderGeometry = new CylinderGeometry(1, 1, 1, 40, 1);
const coneGeometry = new ConeGeometry(1, 1, 16, 1);
const planeGeometry = new PlaneGeometry();
const sphereGeometry = new SphereGeometry(1, 9, 9);
export const euler = new Euler();
export const vector3 = new Vector3();
export const quaternion = new Quaternion();

export function ReactMesh({
  mesh,
  children,
}: {
  readonly mesh: A3d.Mesh;
  readonly children?: JSX.Element;
}): JSX.Element {
  switch (mesh.geometry.type) {
    case "Box": {
      const { pos, size, rot, holes } = mesh.geometry;
      return holes.length === 0 ? (
        <mesh
          geometry={boxGeometry}
          scale={[size.x, size.y, size.z]}
          position={[pos.x, pos.y, pos.z]}
          rotation={[rot.x, rot.y, rot.z]}
        >
          {children}
        </mesh>
      ) : (
        <ExcrudeBoxPlane geo={mesh.geometry} sizeZ={size.z}>
          {children}
        </ExcrudeBoxPlane>
      );
    }
    case "Cone": {
      const { pos, radius, rot, length } = mesh.geometry;
      return (
        <mesh
          geometry={coneGeometry}
          scale={[radius, length, radius]}
          position={[pos.x, pos.y, pos.z]}
          rotation={[rot.x, rot.y, rot.z]}
        >
          {children}
        </mesh>
      );
    }
    case "Cylinder": {
      const { pos, radius, rot, length, holes } = mesh.geometry;
      return holes.length === 0 ? (
        <mesh
          geometry={cylinderGeometry}
          scale={[radius, length, radius]}
          position={[pos.x, pos.y, pos.z]}
          rotation={[rot.x, rot.y, rot.z]}
        >
          {children}
        </mesh>
      ) : (
        <ExcrudeCylinder cyl={mesh.geometry}>{children}</ExcrudeCylinder>
      );
    }
    case "Plane": {
      const { pos, size, rot, holes } = mesh.geometry;
      return holes.length === 0 ? (
        <mesh
          geometry={planeGeometry}
          scale={[size.x, size.y, 1]}
          position={[pos.x, pos.y, pos.z]}
          rotation={[rot.x, rot.y, rot.z]}
        >
          {children}
        </mesh>
      ) : (
        <ExcrudeBoxPlane geo={mesh.geometry} sizeZ={0}>
          {children}
        </ExcrudeBoxPlane>
      );
    }
    case "Sphere": {
      const { pos, radius } = mesh.geometry;
      return (
        <mesh geometry={sphereGeometry} scale={radius} position={[pos.x, pos.y, pos.z]}>
          {children}
        </mesh>
      );
    }
    case "Shape":
      return <ExcrudeShape s={mesh.geometry}>{children}</ExcrudeShape>;
    case "Text": {
      const { pos, rot, text, fontSize } = mesh.geometry;
      return (
        <Text
          position={[pos.x, pos.y, pos.z]}
          rotation={[rot.x, rot.y, rot.z]}
          fontSize={fontSize}
          textAlign="center"
          letterSpacing={0.001}
          lineHeight={1.5}
          // outlineColor="rgb(255,255,255)"
          // depthOffset={10}
          // outlineWidth={3}
          // outlineOpacity={1}
        >
          {children}
          {text}
        </Text>
      );
    }
    case "Line": {
      const { start, end, thickness } = mesh.geometry;
      return (
        <Line
          points={[
            [start.x, start.y, start.z],
            [end.x, end.y, end.z],
          ]}
          lineWidth={thickness}
          color={mesh.material.normal}
        >
          {children}
        </Line>
      );
    }
    case "Polygon":
      return <Polygon polygon={mesh.geometry}>{children}</Polygon>;
    case "Tube":
      return <Tube tube={mesh.geometry}>{children}</Tube>;
    default:
      return <group />;
  }
}

function ExcrudeBoxPlane({
  geo,
  sizeZ,
  children,
}: {
  readonly geo: A3d.Box | A3d.Plane;
  readonly sizeZ: number;
  readonly children?: JSX.Element;
}): JSX.Element {
  const half = A3d.vec2Scale(geo.size, 0.5);

  const excrudeGeometry = React.useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-half.x, -half.y).lineTo(-half.x, half.y).lineTo(half.x, half.y).lineTo(half.x, -half.y).closePath();
    holes(geo.holes, shape);
    return new ExtrudeGeometry(shape, { depth: sizeZ, bevelEnabled: false });
  }, [geo]);

  return (
    // Doesn't seem to adjust for excrude z size directly???
    <mesh rotation={[geo.rot.x, geo.rot.y, geo.rot.z]} position={[geo.pos.x, geo.pos.y, geo.pos.z]}>
      <mesh geometry={excrudeGeometry} position-z={-sizeZ / 2}>
        {children}
      </mesh>
    </mesh>
  );
}

function ExcrudeShape({ s, children }: { readonly s: A3d.Shape; readonly children?: JSX.Element }): JSX.Element {
  const excrudeGeometry = React.useMemo(() => {
    const shape = new Shape();
    if (s.points.length > 0) {
      const p = s.points[0]!;
      shape.moveTo(p.x, p.y);
    }
    for (let i = 1; i < s.points.length; i++) {
      const p = s.points[i]!;
      shape.lineTo(p.x, p.y);
    }
    shape.closePath();
    holes(s.holes, shape);
    return new ExtrudeGeometry(shape, { depth: s.thickness, bevelEnabled: false });
  }, [s]);

  return (
    // Doesn't seem to adjust for excrude z size directly???
    <mesh rotation={[s.rot.x, s.rot.y, s.rot.z]} position={[s.pos.x, s.pos.y, s.pos.z]}>
      <mesh geometry={excrudeGeometry} position-z={-s.thickness / 2}>
        {children}
      </mesh>
    </mesh>
  );
}

function ExcrudeCylinder({
  cyl,
  children,
}: {
  readonly cyl: A3d.Cylinder;
  readonly children?: JSX.Element;
}): JSX.Element {
  const excrudeGeometry = React.useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0, cyl.radius).absellipse(0, 0, cyl.radius, cyl.radius, 0, Math.PI * 2, true);
    holes(cyl.holes, shape);
    return new ExtrudeGeometry(shape, { depth: cyl.length, bevelEnabled: false });
  }, [cyl]);

  return (
    // Doesn't seem to adjust for excrude z size directly???
    <mesh rotation={[cyl.rot.x, cyl.rot.y, cyl.rot.z]} position={[cyl.pos.x, cyl.pos.y, cyl.pos.z]}>
      <mesh geometry={excrudeGeometry} rotation-x={Math.PI / 2} position-y={+cyl.length / 2}>
        {children}
      </mesh>
    </mesh>
  );
}

function holes(holes: ReadonlyArray<Hole>, shape: Shape): void {
  holes.forEach((h) => {
    switch (h.type) {
      case "RoundHole":
        shape.holes.push(new Path().absarc(h.pos.x, h.pos.y, h.radius, 0, Math.PI * 2, true));
        break;
      case "SquareHole": {
        const path = new Path();
        const halfHole = A3d.vec2Scale(h.size, 0.5);
        const min = A3d.vec2Sub(h.pos, halfHole);
        const max = A3d.vec2Add(h.pos, halfHole);
        path.moveTo(min.x, min.y).lineTo(min.x, max.y).lineTo(max.x, max.y).lineTo(max.x, min.y).closePath();
        shape.holes.push(path);
        break;
      }
      default:
        exhaustiveCheck(h);
    }
  });
}

function Polygon({
  polygon,
  children,
}: {
  readonly polygon: A3d.Polygon;
  readonly children?: JSX.Element;
}): JSX.Element {
  const ref = React.useRef<BufferAttribute>(undefined!);
  const vertices = React.useMemo(() => {
    let newVertices: Float32Array = undefined!;
    switch (polygon.points.length) {
      default:
      case 3: {
        newVertices = new Float32Array(polygon.points.length * 3);
        let i = 0;
        polygon.points.forEach((p) => {
          newVertices[i++] = p.x;
          newVertices[i++] = p.y;
          newVertices[i++] = p.z;
        });
        break;
      }
      case 4: {
        const v0 = polygon.points[0]!;
        const v1 = polygon.points[1]!;
        const v2 = polygon.points[2]!;
        const v3 = polygon.points[3]!;
        newVertices = new Float32Array([
          v0.x,
          v0.y,
          v0.z,
          v1.x,
          v1.y,
          v1.z,
          v2.x,
          v2.y,
          v2.z,
          v2.x,
          v2.y,
          v2.z,
          v3.x,
          v3.y,
          v3.z,
          v0.x,
          v0.y,
          v0.z,
        ]);
        break;
      }
    }
    if (ref.current) {
      ref.current.needsUpdate = true;
    }
    return newVertices;
  }, [polygon]);

  return (
    <mesh
      rotation={[polygon.rot.x, polygon.rot.y, polygon.rot.z]}
      position={[polygon.pos.x, polygon.pos.y, polygon.pos.z]}
    >
      <bufferGeometry attach="geometry" onUpdate={(self) => self.computeVertexNormals()}>
        <bufferAttribute
          attach="attributes-position"
          needsUpdate={true}
          ref={ref}
          array={vertices}
          count={vertices.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      {children}
    </mesh>
  );
}

function Tube({ tube, children }: { readonly tube: A3d.Tube; readonly children?: JSX.Element }): JSX.Element {
  const tubeGeometry = React.useMemo(() => {
    return new TubeGeometry(
      tube.curve.type === "SplineCurve"
        ? new CatmullRomCurve3(tube.curve.points.map((p) => new Vector3(p.x, p.y, p.z)))
        : new CircleCurve(tube.curve),
      9,
      tube.radius,
      9,
      false
    );
  }, [tube]);

  return (
    <mesh
      rotation={[tube.rot.x, tube.rot.y, tube.rot.z]}
      position={[tube.pos.x, tube.pos.y, tube.pos.z]}
      geometry={tubeGeometry}
    >
      {children}
    </mesh>
  );
}

class CircleCurve extends Curve<Vector3> {
  radius: number;
  angleLength: number;
  startAngle: number;

  constructor(circleCurve: A3d.CircleCurve) {
    super();
    this.radius = circleCurve.radius;
    this.startAngle = circleCurve.angleStart;
    this.angleLength = circleCurve.angleLength;
  }

  getPoint(t: number, optionalTarget = new Vector3()): Vector3 {
    return optionalTarget.set(
      -this.radius * Math.sin(this.startAngle + this.angleLength * t),
      -this.radius * Math.cos(this.startAngle + this.angleLength * t),
      0
    );
  }
}
