import type { A3D } from "../../../abstract-3d/src/index.js";

export const filterWall = {
  center_deprecated: {
    x: -150,
    y: 250,
    z: 0,
  },
  size_deprecated: {
    x: 600,
    y: 450,
    z: 950,
  },
  groups: [
    {
      meshes: [],
      pos: {
        x: -150,
        y: 250,
        z: 0,
      },
      rot: {
        x: -3.141592653589793,
        y: 0,
        z: -3.141592653589793,
      },
      data: {
        id: "98b62701-f81e-4416-8c47-d186325b7022",
        box: "box",
      },
      groups: [
        {
          meshes: [
            {
              geometry: {
                type: "Box",
                pos: {
                  x: -250,
                  y: -187,
                  z: 0.5,
                },
                rot: {
                  x: 0,
                  y: 0,
                  z: 0,
                },
                size: {
                  x: 20,
                  y: 20,
                  z: 792,
                },
                holes: [],
              },
              material: {
                opacity: 1,
                normal: "rgb(120,120,120)",
                metalness: 0.45,
                roughness: 0.4,
              },
            },
            {
              geometry: {
                type: "Box",
                pos: {
                  x: -250,
                  y: 185,
                  z: 0.5,
                },
                rot: {
                  x: 0,
                  y: 0,
                  z: 0,
                },
                size: {
                  x: 20,
                  y: 20,
                  z: 792,
                },
                holes: [],
              },
              material: {
                opacity: 1,
                normal: "rgb(120,120,120)",
                metalness: 0.45,
                roughness: 0.4,
              },
            },
            {
              geometry: {
                type: "Box",
                pos: {
                  x: -250,
                  y: -1,
                  z: -385.5,
                },
                rot: {
                  x: 0,
                  y: 0,
                  z: 0,
                },
                size: {
                  x: 20,
                  y: 352,
                  z: 20,
                },
                holes: [],
              },
              material: {
                opacity: 1,
                normal: "rgb(120,120,120)",
                metalness: 0.45,
                roughness: 0.4,
              },
            },
            {
              geometry: {
                type: "Box",
                pos: {
                  x: -250,
                  y: -1,
                  z: 386.5,
                },
                rot: {
                  x: 0,
                  y: 0,
                  z: 0,
                },
                size: {
                  x: 20,
                  y: 352,
                  z: 20,
                },
                holes: [],
              },
              material: {
                opacity: 1,
                normal: "rgb(120,120,120)",
                metalness: 0.45,
                roughness: 0.4,
              },
            },
            {
              geometry: {
                type: "Box",
                pos: {
                  x: 20,
                  y: -1,
                  z: 0.5,
                },
                rot: {
                  x: 0,
                  y: 0,
                  z: 0,
                },
                size: {
                  x: 500,
                  y: 392,
                  z: 792,
                },
                holes: [],
              },
              material: {
                opacity: 1,
                normal: "rgb(235,235,0)",
                metalness: 0,
                roughness: 1,
              },
            },
            {
              geometry: {
                type: "Text",
                pos: {
                  x: -255,
                  y: -1,
                  z: 0.5,
                },
                text: "792x392",
                fontSize: 66,
                rot: {
                  x: 0,
                  y: 0,
                  z: 0,
                },
              },
              material: {
                normal: "rgb(0, 0, 0)",
                opacity: 1,
                roughness: 1,
                metalness: 0,
              },
            },
          ],
          pos: {
            x: -10,
            y: 0,
            z: 0,
          },
          rot: {
            x: 0,
            y: 0,
            z: 0,
          },
          data: {},
          groups: [],
        },
      ],
    },
  ],
  dimensions_deprecated: {
    dimensions: [],
    material: {
      opacity: 1,
      normal: "rgb(65,65,65)",
      metalness: 0,
      roughness: 1,
    },
  },
  rotation_deprecated: {
    x: 0,
    y: 0,
    z: 0,
  },
  hotSpots_deprecated: [],
} satisfies A3D.Scene;
