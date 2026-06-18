import React from "react";
import * as React3Js from "../../../abstract-3d/src/renderers/react/index.js";
import { systemair } from "./systemair.js";

export function Abstract3DAutoSizeExample(): React.ReactNode {
  const [cameraType, setCameraType] = React.useState<"Perspective" | "Orthographic">("Perspective");
  const [newZoomLogic, setZoomLogic] = React.useState<boolean>(false);

  const camera = React.useMemo((): React3Js.Camera => {
    if (cameraType === "Orthographic") {
      return {
        type: "Orthographic",
        near: 100,
        far: 50000,
      };
    }

    return {
      type: "Perspective",
      near: 100,
      far: 50000,
      fov: 50,
    };
  }, [cameraType]);

  const controlsHelper: React3Js.ControlsHelper = {
    type: "Viewcube",
    props: { alignment: "top-right", margin: [63, 55] },
    viewcubeProps: {
      resetZoomAndPanOnClick: true,
      color: "#ffffff",
      font: "700 30px Inter, Arial, sans-serif",
      strokeColor: "#112b31",
      textColor: "#112b31",
      hoverColor: "#558592",
      opacity: 0.8,
    },
  };

  const orbitContolProps = {
    enableDamping: true,
    zoomToCursor: false,
    dampingFactor: 0.3,
    minDistance: 100,
    maxDistance: 12000,
    zoomSpeed: 1.5,
  };

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: 8 }}>
        <label>
          Camera:
          <select
            value={cameraType}
            onChange={(e) => setCameraType(e.target.value as "Perspective" | "Orthographic")}
            style={{ marginLeft: 8 }}
          >
            <option value="Perspective">Perspective</option>
            <option value="Orthographic">Orthographic</option>
          </select>
        </label>
      </div>
      <div style={{ padding: 8 }}>
        <label>
          Use New Zoom logic:
          <input type="checkbox" checked={newZoomLogic} onChange={() => setZoomLogic(!newZoomLogic)} />
        </label>
      </div>

      <React3Js.render
        sceneFallback={<div>Loading</div>}
        useAlphaTest={false}
        selectedIds={{}}
        scene={systemair}
        showDimensions={true}
        camera={camera}
        controlsHelper={controlsHelper}
        orbitContolsProps={orbitContolProps}
        canvasProps={{ style: { backgroundColor: "#ccc" } }}
        //newZoomLogic={newZoomLogic}
        useAnimations={true}
        onClickHotSpot={undefined}
        onClickGroup={undefined}
        onContextMenuGroup={undefined}
        createGroupKey={undefined}
        createGroupId={undefined}
        useOldMode={true}
      />
    </div>
  );
}
