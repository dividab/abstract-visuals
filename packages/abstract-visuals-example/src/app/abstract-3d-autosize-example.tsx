import React from "react";
import * as React3Js from "../../../abstract-3d/src/renderers/react/index.js";
import { systemair } from "./systemair.js";
import { systemair2 } from "./systemair-2.js";
import { systemair3 } from "./systemair-3.js";
import { systemair4 } from "./systemair-4.js";
import { systemair5 } from "./systemair-5.js";
import { systemair6 } from "./systemair-6.js";

export function Abstract3DAutoSizeExample(): React.ReactNode {
  const [cameraType, setCameraType] = React.useState<"Perspective" | "Orthographic">("Perspective");
  const [model, setModel] = React.useState<string>("systemair");

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

  const left = 100;
  const top = 100;
  const right = 100;
  const bottom = 100;

  const selectedModel = (() => {
    switch (model) {
      case "systemair1":
        return systemair;

      case "systemair2":
        return systemair2;

      case "systemair3":
        return systemair3;
      case "systemair4":
        return systemair4;
      case "systemair5":
        return systemair5;
      case "systemair6":
        return systemair6;

      default:
        return systemair;
    }
  })();

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
          3D model:
          <select value={model} onChange={(e) => setModel(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="systemair1">1</option>
            <option value="systemair2">2</option>
            <option value="systemair3">3</option>
            <option value="systemair4">4</option>
            <option value="systemair5">5</option>
            <option value="systemair6">6</option>
          </select>
        </label>
      </div>

      {/* 3D + overlays container */}
      <div
        style={{
          position: "relative",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* LEFT PANEL */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: `${left}px`,
            background: "rgba(0,0,0,0.6)",
            color: "white",
            padding: 12,
            zIndex: 10,
          }}
        >
          Left panel
        </div>

        {/* RIGHT PANEL */}
        <div
          style={{
            position: "absolute",
            top: 200,
            right: 0,
            bottom: 0,
            width: `${right}px`,
            background: "rgba(0,0,0,0.6)",
            color: "white",
            padding: 12,
            zIndex: 10,
          }}
        >
          Right panel
        </div>

        {/* TOP PANEL */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 200,
            height: `${top}px`,
            background: "rgba(20,20,20,0.7)",
            color: "white",
            padding: 12,
            zIndex: 10,
          }}
        >
          Top panel
        </div>

        {/* BOTTOM PANEL */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${bottom}px`,
            background: "rgba(20,20,20,0.7)",
            color: "white",
            padding: 12,
            zIndex: 10,
          }}
        >
          Bottom panel
        </div>

        {/* 3D VIEW */}
        <React3Js.render
          sceneFallback={<div>Loading</div>}
          useAlphaTest={false}
          selectedIds={{}}
          fitPadding={0.15}
          scene={selectedModel}
          showDimensions={true}
          camera={camera}
          controlsHelper={controlsHelper}
          orbitContolsProps={orbitContolProps}
          bufferZones={{ left: left, right: right, top: top, bottom: bottom }}
          canvasProps={{
            style: {
              backgroundColor: "#ccc",
              width: "100%",
              height: "100%",
            },
          }}
          useAnimations={true}
          onClickHotSpot={undefined}
          onClickGroup={undefined}
          onContextMenuGroup={undefined}
          createGroupKey={undefined}
          createGroupId={undefined}
          useOldMode={true}
        />
      </div>
    </div>
  );
}
