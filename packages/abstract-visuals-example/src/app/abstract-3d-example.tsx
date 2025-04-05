import React from "react";
import FileSaver from "file-saver";
import * as A3D from "../../../abstract-3d/src/index.js";
import { systemair } from "./systemair.js";
import { vortice } from "./vortice.js";
import { cylinderFilter } from "./cylinder-filter.js";

export function Abstract3DExample(): React.ReactNode {
  const [selected, setSelected] = React.useState<string | undefined>(undefined);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", height: "20px", background: "rgb(251,  251, 251)" }}>
        <button
          onClick={() => FileSaver.saveAs(new Blob([A3D.toDxf(systemair, "front")], { type: "text/plain" }), `a3d.dxf`)}
        >
          DXF
        </button>
        <button onClick={() => FileSaver.saveAs(new Blob([A3D.toStl(systemair)], { type: "text/plain" }), `a3d.stl`)}>
          STL
        </button>
        <button onClick={() => FileSaver.saveAs(new Blob([A3D.toStep(systemair)], { type: "text/plain" }), `a3d.stp`)}>
          STEP
        </button>
        <button
          onClick={() =>
            FileSaver.saveAs(
              new Blob([A3D.toSvg(systemair, "front", 2, { size: 180, scaleByWidth: true }).image], {
                type: "text/plain",
              }),
              `a3d.svg`
            )
          }
        >
          SVG
        </button>
      </div>
      <div
        dangerouslySetInnerHTML={{
          __html: A3D.toSvg(
            systemair,
            "front",
            1,
            { size: 400, scaleByWidth: true },
            false,
            false,
            undefined,
            undefined,
            undefined,
            0
          ).image,
        }}
      />
      <div style={{ height: "calc(100% - 20px)", width: "100%", display: "flex" }}>
        <div style={{ height: "100%", width: "50%", display: "flex", flexDirection: "column" }}>
          <A3D.toReact
            selectedId={selected}
            onClickGroup={(id) => setSelected(id)}
            createGroupId={(g) => g.data?.id ?? ""}
            scene={systemair}
            orbitContolsProps={{ enableDamping: false }}
            camera={camera}
          />
        </div>
        <div style={{ height: "100%", width: "50%", display: "flex", flexDirection: "column" }}>
          <A3D.toReact
            selectedId={selected}
            onClickGroup={(id) => setSelected(id)}
            createGroupId={(g) => g.data?.id ?? ""}
            scene={vortice}
            orbitContolsProps={{ enableDamping: false }}
            camera={camera}
          />
        </div>
      </div>
    </div>
  );
}

const camera: A3D.Camera = { type: "Perspective", near: 100, far: 19000, fov: 60 };
