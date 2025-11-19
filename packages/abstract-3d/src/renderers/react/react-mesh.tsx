/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
/* eslint-disable functional/prefer-readonly-type */
import React from "react";
import { extend } from "@react-three/fiber";
import { Text, Line } from "@react-three/drei";
import {
  BoxGeometry,
  BufferAttribute,
  CatmullRomCurve3,
  ConeGeometry,
  Curve,
  CylinderGeometry,
  Euler,
  ExtrudeGeometry,
  Path,
  PlaneGeometry,
  Quaternion,
  Shape,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import {
  Mesh,
  Box,
  Plane,
  vec2Scale,
  Shape as Shape_1,
  Cylinder,
  vec2Sub,
  vec2Add,
  Polygon as A3dPolygon,
  Tube as A3dTube,
  CircleCurve as A3dCircleCurve,
  Hole,
  isZero,
  vec3Scale,
  vec3,
  vec3Add,
  vec3RotCombine,
  vec3Zero,
  vec3Rot,
  equals,
} from "../../abstract-3d.js";
import { exhaustiveCheck } from "ts-exhaustive-check";

extend({
  SphereGeometry,
  PlaneGeometry,
  ConeGeometry,
  Quaternion,
  Vector3,
  Euler,
  BoxGeometry,
  Path,
  Shape,
  TubeGeometry,
  CatmullRomCurve3,
  BufferAttribute,
  ExtrudeGeometry,
  CylinderGeometry,
});

const CYLINDER_SEGMENTS = 40;
const boxGeometry = new BoxGeometry();
const cylinderGeometry = new CylinderGeometry(1, 1, 1, CYLINDER_SEGMENTS, 1);
const cylinderGeometryOpen = new CylinderGeometry(1, 1, 1, CYLINDER_SEGMENTS, 1, true);
const coneGeometry = new ConeGeometry(1, 1, 16, 1);
const planeGeometry = new PlaneGeometry();
const sphereGeometry = new SphereGeometry(1, 12, 12);
export const euler = new Euler();
export const vector3 = new Vector3();
export const quaternion = new Quaternion();

export function ReactMesh({
  mesh,
  children,
}: {
  readonly mesh: Mesh;
  readonly children?: React.JSX.Element;
}): React.JSX.Element {
  switch (mesh.geometry.type) {
    case "Box": {
      const { pos, size, rot, holes } = mesh.geometry;
      const filteredHoles = holes?.filter((h) => !holeIsZero(h));
      return !filteredHoles || filteredHoles.length === 0 ? (
        <mesh
          geometry={boxGeometry}
          scale={[size.x, size.y, size.z]}
          position={[pos.x, pos.y, pos.z]}
          rotation={[rot?.x ?? 0, rot?.y ?? 0, rot?.z ?? 0]}
          castShadow
          receiveShadow
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
          rotation={[rot?.x ?? 0, rot?.y ?? 0, rot?.z ?? 0]}
          castShadow
          receiveShadow
        >
          {children}
        </mesh>
      );
    }
    case "Cylinder": {
      const { pos, radius, rot, length, holes, open, angleStart, angleLength } = mesh.geometry;
      const filteredHoles = holes?.filter((h) => !holeIsZero(h));
      const hasAngles = angleStart !== undefined && angleLength !== undefined;
      const isWhole = !hasAngles || (isZero(Math.PI * 2 - angleLength) && isZero(angleStart));
      if (isWhole) {
        return !filteredHoles || filteredHoles.length === 0 ? (
          <mesh
            geometry={open ? cylinderGeometryOpen : cylinderGeometry}
            scale={[radius, length, radius]}
            position={[pos.x, pos.y, pos.z]}
            rotation={[rot?.x ?? 0, rot?.y ?? 0, rot?.z ?? 0]}
            castShadow
            receiveShadow
          >
            {children}
          </mesh>
        ) : (
          <ExcrudeCylinder cyl={mesh.geometry}>{children}</ExcrudeCylinder>
        );
      } else {
        const angledCylinder = new CylinderGeometry(1, 1, 1, CYLINDER_SEGMENTS, 1, false, angleStart, angleLength);
        const angleEnd = angleStart + angleLength;
        const halfRadius = radius / 2;
        const aStart = angleStart - Math.PI / 2;
        const aEnd = angleEnd - Math.PI / 2;
        const plane1Rot = vec3RotCombine(rot ?? vec3Zero, vec3(0, aStart, 0));
        const plane2Rot = vec3RotCombine(rot ?? vec3Zero, vec3(0, aEnd, 0));
        const plane1Pos = vec3Add(
          vec3Rot(vec3Scale(vec3(Math.cos(aStart), 0, -Math.sin(aStart)), halfRadius), vec3Zero, rot ?? vec3Zero),
          pos
        );
        const plane2Pos = vec3Add(
          vec3Rot(vec3Scale(vec3(Math.cos(aEnd), 0, -Math.sin(aEnd)), halfRadius), vec3Zero, rot ?? vec3Zero),
          pos
        );
        return (
          <mesh>
            <mesh
              geometry={angledCylinder}
              scale={[radius, length, radius]}
              position={[pos.x, pos.y, pos.z]}
              rotation={[rot?.x ?? 0, rot?.y ?? 0, rot?.z ?? 0]}
              castShadow
              receiveShadow
            >
              {children}
            </mesh>
            <mesh
              geometry={planeGeometry}
              scale={[radius, length, 1]}
              position={[plane1Pos.x, plane1Pos.y, plane1Pos.z]}
              rotation={[plane1Rot.x, plane1Rot.y, plane1Rot.z]}
              castShadow
              receiveShadow
            >
              {children}
            </mesh>
            <mesh
              geometry={planeGeometry}
              scale={[radius, length, 1]}
              position={[plane2Pos.x, plane2Pos.y, plane2Pos.z]}
              rotation={[plane2Rot.x, plane2Rot.y, plane2Rot.z]}
              castShadow
              receiveShadow
            >
              {children}
            </mesh>
          </mesh>
        );
      }
    }
    case "Plane": {
      const { pos, size, rot, holes } = mesh.geometry;
      const filteredHoles = holes?.filter((h) => !holeIsZero(h));
      return !filteredHoles || filteredHoles.length === 0 ? (
        <mesh
          geometry={planeGeometry}
          scale={[size.x, size.y, 1]}
          position={[pos.x, pos.y, pos.z]}
          rotation={[rot?.x ?? 0, rot?.y ?? 0, rot?.z ?? 0]}
          castShadow
          receiveShadow
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
        <mesh geometry={sphereGeometry} scale={radius} position={[pos.x, pos.y, pos.z]} castShadow receiveShadow>
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
          rotation={[rot?.x ?? 0, rot?.y ?? 0, rot?.z ?? 0]}
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
  readonly geo: Box | Plane;
  readonly sizeZ: number;
  readonly children?: React.JSX.Element;
}): React.JSX.Element {
  const half = vec2Scale(geo.size, 0.5);

  const excrudeGeometry = React.useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-half.x, -half.y).lineTo(-half.x, half.y).lineTo(half.x, half.y).lineTo(half.x, -half.y).closePath();
    holes(geo.holes, shape);
    return new ExtrudeGeometry(shape, { depth: sizeZ, bevelEnabled: false });
  }, [geo]);

  return (
    // Doesn't seem to adjust for excrude z size directly???
    <mesh rotation={[geo.rot?.x ?? 0, geo.rot?.y ?? 0, geo.rot?.z ?? 0]} position={[geo.pos.x, geo.pos.y, geo.pos.z]}>
      <mesh geometry={excrudeGeometry} position-z={-sizeZ / 2} castShadow receiveShadow>
        {children}
      </mesh>
    </mesh>
  );
}

function ExcrudeShape({
  s,
  children,
}: {
  readonly s: Shape_1;
  readonly children?: React.JSX.Element;
}): React.JSX.Element {
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
    <mesh rotation={[s.rot?.x ?? 0, s.rot?.y ?? 0, s.rot?.z ?? 0]} position={[s.pos.x, s.pos.y, s.pos.z]}>
      <mesh geometry={excrudeGeometry} position-z={-s.thickness / 2} castShadow receiveShadow>
        {children}
      </mesh>
    </mesh>
  );
}

function ExcrudeCylinder({
  cyl,
  children,
}: {
  readonly cyl: Cylinder;
  readonly children?: React.JSX.Element;
}): React.JSX.Element {
  const excrudeGeometry = React.useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0, cyl.radius).absellipse(0, 0, cyl.radius, cyl.radius, 0, Math.PI * 2, true);
    holes(cyl.holes, shape);
    return new ExtrudeGeometry(shape, { depth: cyl.length, bevelEnabled: false });
  }, [cyl]);

  return (
    // Doesn't seem to adjust for excrude z size directly???
    <mesh rotation={[cyl.rot?.x ?? 0, cyl.rot?.y ?? 0, cyl.rot?.z ?? 0]} position={[cyl.pos.x, cyl.pos.y, cyl.pos.z]}>
      <mesh geometry={excrudeGeometry} rotation-x={Math.PI / 2} position-y={+cyl.length / 2} castShadow receiveShadow>
        {children}
      </mesh>
    </mesh>
  );
}

function holes(holes: ReadonlyArray<Hole> | undefined, shape: Shape): void {
  holes
    ?.filter((h) => !holeIsZero(h))
    .forEach((h) => {
      switch (h.type) {
        case "RoundHole":
          shape.holes.push(new Path().absarc(h.pos.x, h.pos.y, h.radius, 0, Math.PI * 2, true));
          break;
        case "SquareHole": {
          const path = new Path();
          const halfHole = vec2Scale(h.size, 0.5);
          const min = vec2Sub(h.pos, halfHole);
          const max = vec2Add(h.pos, halfHole);
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
  readonly polygon: A3dPolygon;
  readonly children?: React.JSX.Element;
}): React.JSX.Element {
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
      rotation={[polygon.rot?.x ?? 0, polygon.rot?.y ?? 0, polygon.rot?.z ?? 0]}
      position={[polygon.pos.x, polygon.pos.y, polygon.pos.z]}
      castShadow
      receiveShadow
    >
      <bufferGeometry attach="geometry" onUpdate={(self) => self.computeVertexNormals()}>
        <bufferAttribute
          attach="attributes-position"
          needsUpdate={true}
          ref={ref}
          args={fakeArgs}
          array={vertices}
          count={vertices.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      {children}
    </mesh>
  );
}

const fakeArgs = [] as any;

function Tube({
  tube,
  children,
}: {
  readonly tube: A3dTube;
  readonly children?: React.JSX.Element;
}): React.JSX.Element {
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
      rotation={[tube.rot?.x ?? 0, tube.rot?.y ?? 0, tube.rot?.z ?? 0]}
      position={[tube.pos.x, tube.pos.y, tube.pos.z]}
      geometry={tubeGeometry}
      castShadow
      receiveShadow
    >
      {children}
    </mesh>
  );
}

function holeIsZero(hole: Hole): boolean {
  switch (hole.type) {
    case "RoundHole": {
      return equals(hole.radius, 0.0);
    }
    case "SquareHole": {
      return equals(hole.size.x, 0.0) || equals(hole.size.y, 0.0);
    }
    default:
      return false;
  }
}

class CircleCurve extends Curve<Vector3> {
  radius: number;
  angleLength: number;
  startAngle: number;

  constructor(circleCurve: A3dCircleCurve) {
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
