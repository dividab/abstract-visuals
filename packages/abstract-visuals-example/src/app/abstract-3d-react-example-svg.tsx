import * as React from "react";
import * as A3D from "../../../abstract-3d/lib/index.js";

export function Abstract3DReactExample(): JSX.Element {
  return A3D.toReact({
    scene: {
      center: A3D.vec3Zero,
      data: {},
      groups: [
        {
          data: {},
          groups: [],
          pos: A3D.vec3Zero,
          rot: A3D.vec3Zero,
          meshes: [
            {
              geometry: A3D.boxGeometry(A3D.vec3(1, 1, 1)),
              material: {
                dxf: "1",
                hover: "rgb(50,50,50)",
                normal: "rgb(150,150,150)",
                image: { type: "NoImage" },
                imageType: "",
                opacity: 1,
                selected: "rgb(100,100,250)",
                shininess: 100,
                type: "Phong",
              },
            },
          ],
        },
      ],
      size: A3D.vec3Zero,
    },
  });
}
