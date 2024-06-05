import * as React from "react";
import FileSaver from "file-saver";
import * as A3D from "abstract-3d";

export function Abstract3DExample(): React.ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", height: "20px", background: "rgb(251,  251, 251)" }}>
        <button
          onClick={() => FileSaver.saveAs(new Blob([A3D.toDxf(scene, "front")], { type: "text/plain" }), `a3d.dxf`)}
        >
          DXF
        </button>
        <button onClick={() => FileSaver.saveAs(new Blob([A3D.toStl(scene)], { type: "text/plain" }), `a3d.stl`)}>
          STL
        </button>
        <button
          onClick={() =>
            FileSaver.saveAs(
              new Blob([A3D.toSvg(scene, "front", 2, { size: 180, scaleByWidth: true }).image], { type: "text/plain" }),
              `a3d.svg`
            )
          }
        >
          SVG
        </button>
      </div>
      <div style={{ height: "calc(100% - 20px)" }}>
        <A3D.toReact scene={scene} />
      </div>
    </div>
  );
}

const scene: A3D.Scene = {
  center_deprecated: A3D.vec3Zero,
  size_deprecated: A3D.vec3(40, 40, 40),
  groups: [
    {
      pos: A3D.vec3Zero,
      meshes: [
        A3D.box(
          A3D.vec3(10, 2, 10),
          { type: "Phong", hover: "rgb(50,50,50)", normal: "rgb(150,150,150)" },
          A3D.vec3(0, -6, 0)
        ),
        A3D.box(
          A3D.vec3(1, 10, 1),
          { type: "Phong", hover: "rgb(50,50,50)", normal: "rgb(150,150,150)" },
          A3D.vec3(-4.5, 0, 4.5)
        ),
        A3D.box(
          A3D.vec3(1, 10, 1),
          { type: "Phong", hover: "rgb(50,50,50)", normal: "rgb(150,150,150)" },
          A3D.vec3(4.5, 0, 4.5)
        ),
        A3D.box(
          A3D.vec3(1, 10, 1),
          { type: "Phong", hover: "rgb(50,50,50)", normal: "rgb(150,150,150)" },
          A3D.vec3(-4.5, 0, -4.5)
        ),
        A3D.box(
          A3D.vec3(1, 10, 1),
          { type: "Phong", hover: "rgb(50,50,50)", normal: "rgb(150,150,150)" },
          A3D.vec3(4.5, 0, -4.5)
        ),
        A3D.box(
          A3D.vec3(10, 2, 10),
          { type: "Phong", hover: "rgb(50,50,50)", normal: "rgb(150,150,150)" },
          A3D.vec3(0, 6, 0)
        ),
        A3D.sphere(3, { type: "Phong", hover: "rgb(120,30,30)", normal: "rgb(150,50,50)" }, A3D.vec3(0, 0, 0)),
      ],
    },
  ],
};
