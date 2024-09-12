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
        <button onClick={() => FileSaver.saveAs(new Blob([A3D.toStep(scene)], { type: "text/plain" }), `a3d.stp`)}>
          STEP
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
      <div
        dangerouslySetInnerHTML={{
          __html: A3D.toSvg(scene, "front", 1, { size: 300, scaleByWidth: true }, true, true, "rgb(255,255,255,1)")
            .image,
        }}
      />
      <div style={{ height: "calc(100% - 20px)" }}>
        <A3D.toReact
          scene={scene}
          orbitContolsProps={{ enableDamping: false, minDistance: 100, maxDistance: 10000, zoomSpeed: 1.5 }}
          camera={{ type: "Perspective", near: 100, far: 19000 }}
        />
      </div>
    </div>
  );
}

const scene2: A3D.Scene = {
  center_deprecated: A3D.vec3(100, 100, 100),
  size_deprecated: A3D.vec3(300, 300, 300),
  groups: [
    {
      pos: A3D.vec3(100, 100, 100),
      meshes: [
        A3D.box(
          A3D.vec3(100, 100, 100),
          { type: "Phong", hover: "rgb(50,50,50)", normal: "rgb(150,150,150)" },
          A3D.vec3(0, 0, 0)
        ),
      ],
    },
  ],
};

const scene3: A3D.Scene = {
  center_deprecated: A3D.vec3(10, 10, 10),
  size_deprecated: A3D.vec3(20, 20, 20),
  groups: [
    {
      pos: A3D.vec3(10, 10, 10),
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

const scene = {
  center_deprecated: {
    x: 50,
    y: 425.00000000000006,
    z: 31.5,
  },
  size_deprecated: {
    x: 2100,
    y: 900.0000000000001,
    z: 1013,
  },
  hotSpots_deprecated: [],
  groups: [
    {
      meshes: [
        {
          geometry: {
            type: "Box",
            pos: {
              x: 0,
              y: 225,
              z: 0,
            },
            rot: {
              x: 0,
              y: 0,
              z: 0,
            },
            size: {
              x: 400,
              y: 900,
              z: 950,
            },
            holes: [],
          },
          material: {
            type: 0,
            normal: "rgb(43, 103, 119)",
            hover: "rgb(23, 83, 99)",
            selected: "rgb(14,82,184)",
            dxf: "143",
            opacity: 0.3,
            shininess: 50,
          },
        },
        {
          geometry: {
            type: "Plane",
            pos: {
              x: 0,
              y: 250,
              z: 538,
            },
            rot: {
              x: 0,
              y: 0,
              z: 0,
            },
            size: {
              x: 320,
              y: 720,
              z: 0,
            },
            holes: [],
          },
          material: {
            type: 2,
            normal: "rgb(255,255,255)",
            hover: "rgb(205,205,205)",
            selected: "rgb(99,152,231)",
            dxf: "255",
            opacity: 1,
            shininess: 50,
            image: {
              type: "UrlImage",
              url: "/promaster-blobs/df41aa33209fe7ea46c2c3ec16c89fe855675f4a?database_id=628c2d04-c86d-4b85-9193-099437a1b6a9&file=df41aa33209fe7ea46c2c3ec16c89fe855675f4a.svg",
              imageType: "svg",
            },
          },
        },
      ],
      pos: {
        x: 0,
        y: 200,
        z: 0,
      },
      rot: {
        x: 0,
        y: 0,
        z: 0,
      },
      data: {
        id: "GXC",
        box: "supply",
      },
      groups: [],
    },
    {
      meshes: [
        {
          geometry: {
            type: "Box",
            pos: {
              x: 0,
              y: 0,
              z: 0,
            },
            rot: {
              x: 0,
              y: 0,
              z: 0,
            },
            size: {
              x: 700,
              y: 450,
              z: 950,
            },
            holes: [],
          },
          material: {
            type: 0,
            normal: "rgb(43, 103, 119)",
            hover: "rgb(23, 83, 99)",
            selected: "rgb(14,82,184)",
            dxf: "143",
            opacity: 0.3,
            shininess: 50,
          },
        },
        {
          geometry: {
            type: "Plane",
            pos: {
              x: 0,
              y: 0,
              z: 538,
            },
            rot: {
              x: 0,
              y: 0,
              z: 0,
            },
            size: {
              x: 560,
              y: 360,
              z: 0,
            },
            holes: [],
          },
          material: {
            type: 2,
            normal: "rgb(255,255,255)",
            hover: "rgb(205,205,205)",
            selected: "rgb(99,152,231)",
            dxf: "255",
            opacity: 1,
            shininess: 50,
            image: {
              type: "UrlImage",
              url: "/promaster-blobs/a7c1b10782e66a7781b4d1e3be12208716a166c5?database_id=628c2d04-c86d-4b85-9193-099437a1b6a9&file=a7c1b10782e66a7781b4d1e3be12208716a166c5.svg",
              imageType: "svg",
            },
          },
        },
      ],
      pos: {
        x: 550,
        y: 200,
        z: 0,
      },
      rot: {
        x: 0,
        y: 0,
        z: 0,
      },
      data: {
        id: "VF_S_OUT",
        box: "box",
      },
      groups: [],
    },
    {
      meshes: [
        {
          geometry: {
            type: "Box",
            pos: {
              x: 0,
              y: 0,
              z: 0,
            },
            rot: {
              x: 0,
              y: 0,
              z: 0,
            },
            size: {
              x: 600,
              y: 450,
              z: 950,
            },
            holes: [],
          },
          material: {
            type: 0,
            normal: "rgb(43, 103, 119)",
            hover: "rgb(23, 83, 99)",
            selected: "rgb(14,82,184)",
            dxf: "143",
            opacity: 0.3,
            shininess: 50,
          },
        },
        {
          geometry: {
            type: "Plane",
            pos: {
              x: 0,
              y: 0,
              z: 538,
            },
            rot: {
              x: 0,
              y: 0,
              z: 0,
            },
            size: {
              x: 480,
              y: 360,
              z: 0,
            },
            holes: [],
          },
          material: {
            type: 2,
            normal: "rgb(255,255,255)",
            hover: "rgb(205,205,205)",
            selected: "rgb(99,152,231)",
            dxf: "255",
            opacity: 1,
            shininess: 50,
            image: {
              type: "UrlImage",
              url: "/promaster-blobs/50591c6cc90df9c8418bc8a17db06a8f84de5902?database_id=628c2d04-c86d-4b85-9193-099437a1b6a9&file=50591c6cc90df9c8418bc8a17db06a8f84de5902.svg",
              imageType: "svg",
            },
          },
        },
      ],
      pos: {
        x: -500,
        y: 200,
        z: 0,
      },
      rot: {
        x: 0,
        y: 0,
        z: 0,
      },
      data: {
        id: "F_S_IN",
        box: "box",
      },
      groups: [],
    },
    {
      meshes: [
        {
          geometry: {
            type: "Box",
            pos: {
              x: 0,
              y: 0,
              z: 0,
            },
            rot: {
              x: 0,
              y: 0,
              z: 0,
            },
            size: {
              x: 700,
              y: 450,
              z: 950,
            },
            holes: [],
          },
          material: {
            type: 0,
            normal: "rgb(43, 103, 119)",
            hover: "rgb(23, 83, 99)",
            selected: "rgb(14,82,184)",
            dxf: "143",
            opacity: 0.3,
            shininess: 50,
          },
        },
        {
          geometry: {
            type: "Plane",
            pos: {
              x: 0,
              y: 0,
              z: -538,
            },
            rot: {
              x: 0,
              y: 3.141592653589793,
              z: 3.141592653589793,
            },
            size: {
              x: 560,
              y: 360,
              z: 0,
            },
            holes: [],
          },
          material: {
            type: 2,
            normal: "rgb(255,255,255)",
            hover: "rgb(205,205,205)",
            selected: "rgb(99,152,231)",
            dxf: "255",
            opacity: 1,
            shininess: 50,
            image: {
              type: "UrlImage",
              url: "/promaster-blobs/a7c1b10782e66a7781b4d1e3be12208716a166c5?database_id=628c2d04-c86d-4b85-9193-099437a1b6a9&file=a7c1b10782e66a7781b4d1e3be12208716a166c5.svg",
              imageType: "svg",
            },
          },
        },
      ],
      pos: {
        x: -550,
        y: 650,
        z: 0,
      },
      rot: {
        x: -3.141592653589793,
        y: 0,
        z: -3.141592653589793,
      },
      data: {
        id: "VF_E_OUT",
        box: "box",
      },
      groups: [],
    },
    {
      meshes: [
        {
          geometry: {
            type: "Box",
            pos: {
              x: 0,
              y: 0,
              z: 0,
            },
            rot: {
              x: 0,
              y: 0,
              z: 0,
            },
            size: {
              x: 600,
              y: 450,
              z: 950,
            },
            holes: [],
          },
          material: {
            type: 0,
            normal: "rgb(43, 103, 119)",
            hover: "rgb(23, 83, 99)",
            selected: "rgb(14,82,184)",
            dxf: "143",
            opacity: 0.3,
            shininess: 50,
          },
        },
        {
          geometry: {
            type: "Plane",
            pos: {
              x: 0,
              y: 0,
              z: -538,
            },
            rot: {
              x: 0,
              y: 3.141592653589793,
              z: 3.141592653589793,
            },
            size: {
              x: 480,
              y: 360,
              z: 0,
            },
            holes: [],
          },
          material: {
            type: 2,
            normal: "rgb(255,255,255)",
            hover: "rgb(205,205,205)",
            selected: "rgb(99,152,231)",
            dxf: "255",
            opacity: 1,
            shininess: 50,
            image: {
              type: "UrlImage",
              url: "/promaster-blobs/50591c6cc90df9c8418bc8a17db06a8f84de5902?database_id=628c2d04-c86d-4b85-9193-099437a1b6a9&file=50591c6cc90df9c8418bc8a17db06a8f84de5902.svg",
              imageType: "svg",
            },
          },
        },
      ],
      pos: {
        x: 500,
        y: 650,
        z: 0,
      },
      rot: {
        x: -3.141592653589793,
        y: 0,
        z: -3.141592653589793,
      },
      data: {
        id: "F_E_IN",
        box: "box",
      },
      groups: [],
    },
    {
      meshes: [
        {
          geometry: {
            type: "Box",
            pos: {
              x: 0,
              y: 0,
              z: 0,
            },
            rot: {
              x: 0,
              y: 0,
              z: 0,
            },
            size: {
              x: 200,
              y: 450,
              z: 950,
            },
            holes: [],
          },
          material: {
            type: 0,
            normal: "rgb(43, 103, 119)",
            hover: "rgb(23, 83, 99)",
            selected: "rgb(14,82,184)",
            dxf: "143",
            opacity: 0.3,
            shininess: 50,
          },
        },
        {
          geometry: {
            type: "Plane",
            pos: {
              x: 0,
              y: 0,
              z: 538,
            },
            rot: {
              x: 0,
              y: 0,
              z: 0,
            },
            size: {
              x: 160,
              y: 360,
              z: 0,
            },
            holes: [],
          },
          material: {
            type: 2,
            normal: "rgb(255,255,255)",
            hover: "rgb(205,205,205)",
            selected: "rgb(99,152,231)",
            dxf: "255",
            opacity: 1,
            shininess: 50,
            image: {
              type: "UrlImage",
              url: "/promaster-blobs/d8219af5ff598004f4ccaf4e863df14a1b3cd920?database_id=628c2d04-c86d-4b85-9193-099437a1b6a9&file=d8219af5ff598004f4ccaf4e863df14a1b3cd920.svg",
              imageType: "svg",
            },
          },
        },
      ],
      pos: {
        x: 1000,
        y: 200,
        z: 0,
      },
      rot: {
        x: 0,
        y: 0,
        z: 0,
      },
      data: {
        id: "H",
        box: "box",
      },
      groups: [],
    },
    {
      meshes: [
        {
          geometry: {
            type: "Box",
            pos: {
              x: 0,
              y: 0,
              z: 0,
            },
            rot: {
              x: 0,
              y: 0,
              z: 0,
            },
            size: {
              x: 200,
              y: 450,
              z: 950,
            },
            holes: [],
          },
          material: {
            type: 0,
            normal: "rgb(43, 103, 119)",
            hover: "rgb(23, 83, 99)",
            selected: "rgb(14,82,184)",
            dxf: "143",
            opacity: 0.3,
            shininess: 50,
          },
        },
        {
          geometry: {
            type: "Plane",
            pos: {
              x: 0,
              y: 0,
              z: 538,
            },
            rot: {
              x: 0,
              y: 0,
              z: 0,
            },
            size: {
              x: 160,
              y: 360,
              z: 0,
            },
            holes: [],
          },
          material: {
            type: 2,
            normal: "rgb(255,255,255)",
            hover: "rgb(205,205,205)",
            selected: "rgb(99,152,231)",
            dxf: "255",
            opacity: 1,
            shininess: 50,
            image: {
              type: "UrlImage",
              url: "/promaster-blobs/19f403f93ecf0ab397f6a6dae401010aa774cb84?database_id=628c2d04-c86d-4b85-9193-099437a1b6a9&file=19f403f93ecf0ab397f6a6dae401010aa774cb84.svg",
              imageType: "svg",
            },
          },
        },
      ],
      pos: {
        x: -900,
        y: 200,
        z: 0,
      },
      rot: {
        x: 0,
        y: 0,
        z: 0,
      },
      data: {
        id: "JS_S_IN",
        box: "box",
      },
      groups: [],
    },
    {
      meshes: [
        {
          geometry: {
            type: "Box",
            pos: {
              x: 0,
              y: 0,
              z: 0,
            },
            rot: {
              x: 0,
              y: 0,
              z: 0,
            },
            size: {
              x: 200,
              y: 450,
              z: 950,
            },
            holes: [],
          },
          material: {
            type: 0,
            normal: "rgb(43, 103, 119)",
            hover: "rgb(23, 83, 99)",
            selected: "rgb(14,82,184)",
            dxf: "143",
            opacity: 0.3,
            shininess: 50,
          },
        },
        {
          geometry: {
            type: "Plane",
            pos: {
              x: 0,
              y: 0,
              z: -538,
            },
            rot: {
              x: 0,
              y: 3.141592653589793,
              z: 3.141592653589793,
            },
            size: {
              x: 160,
              y: 360,
              z: 0,
            },
            holes: [],
          },
          material: {
            type: 2,
            normal: "rgb(255,255,255)",
            hover: "rgb(205,205,205)",
            selected: "rgb(99,152,231)",
            dxf: "255",
            opacity: 1,
            shininess: 50,
            image: {
              type: "UrlImage",
              url: "/promaster-blobs/19f403f93ecf0ab397f6a6dae401010aa774cb84?database_id=628c2d04-c86d-4b85-9193-099437a1b6a9&file=19f403f93ecf0ab397f6a6dae401010aa774cb84.svg",
              imageType: "svg",
            },
          },
        },
      ],
      pos: {
        x: 900,
        y: 650,
        z: 0,
      },
      rot: {
        x: -3.141592653589793,
        y: 0,
        z: -3.141592653589793,
      },
      data: {
        id: "JS_E_IN",
        box: "box",
      },
      groups: [],
    },
  ],
  dimensions_deprecated: {
    dimensions: [],
    material: {
      type: 2,
      normal: "rgb(65,65,65)",
      hover: "rgb(65,65,65)",
      selected: "rgb(65,65,65)",
      dxf: "8",
      opacity: 1,
      shininess: 50,
    },
    bounds: {
      front: {
        min: {
          x: 0,
          y: 0,
        },
        max: {
          x: 0,
          y: 0,
        },
      },
      back: {
        min: {
          x: 0,
          y: 0,
        },
        max: {
          x: 0,
          y: 0,
        },
      },
      left: {
        min: {
          x: 0,
          y: 0,
        },
        max: {
          x: 0,
          y: 0,
        },
      },
      right: {
        min: {
          x: 0,
          y: 0,
        },
        max: {
          x: 0,
          y: 0,
        },
      },
      top: {
        min: {
          x: 0,
          y: 0,
        },
        max: {
          x: 0,
          y: 0,
        },
      },
      bottom: {
        min: {
          x: 0,
          y: 0,
        },
        max: {
          x: 0,
          y: 0,
        },
      },
      threeD: {
        min: {
          x: 0,
          y: 0,
          z: 0,
        },
        max: {
          x: 0,
          y: 0,
          z: 0,
        },
      },
    },
  },
  rotation_deprecated: {
    x: 0,
    y: 0,
    z: 0,
  },
  data: {},
} as unknown as A3D.Scene;
