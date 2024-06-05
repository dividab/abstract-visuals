import * as React from "react";
import * as A3D from "../../../abstract-3d";

export function Abstract3DExampleReact(): React.ReactNode {
  return (
    <A3D.toReact
      scene={{
        center: A3D.vec3Zero,
        size: A3D.vec3(4, 4, 4),
        groups: [
          {
            pos: A3D.vec3Zero,
            meshes: [
              {
                geometry: A3D.boxGeometry(A3D.vec3(1, 1, 1)),
                material: { type: "Phong", hover: "rgb(50,50,50)", normal: "rgb(150,150,150)" },
              },
            ],
          },
        ],
      }}
    />
  );
}
