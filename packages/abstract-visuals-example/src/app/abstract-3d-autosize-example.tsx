import React from "react";
import type * as React3Js from "../../../abstract-3d/src/renderers/react/index.js";
import { Viewer } from "../../../abstract-3d/src/renderers/react/index.js";
import { edgesScene } from "./edges-scene.js";
import { systemair2 } from "./generated/systemair-2.js";
import { systemair3 } from "./generated/systemair-3.js";
import { systemair4 } from "./generated/systemair-4.js";
import { systemair5 } from "./generated/systemair-5.js";
import { systemair6 } from "./generated/systemair-6.js";
import { systemair } from "./generated/systemair.js";
import { assignMaterialTypes } from "./material-types.js";
import { materialsScene } from "./materials-scene.js";
import { roundBoxes } from "./round-boxes.js";
import { getThemedScene, ThemeContext } from "./theme.js";

const sceneFallback = <div>Loading</div>;

export function Abstract3DAutoSizeExample(): React.ReactNode {
  const [cameraType, setCameraType] = React.useState<"Perspective" | "Orthographic">("Perspective");
  const [model, setModel] = React.useState<string>("systemair");
  const [quality, setQuality] = React.useState<React3Js.Quality>("high");
  const [groundShadow, setGroundShadow] = React.useState(true);
  const [typed, setTyped] = React.useState(true);
  const [shadows, setShadows] = React.useState(true);
  const [studio, setStudio] = React.useState<"on" | "off" | "compare">("on");

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
      case "materials":
        return materialsScene;
      case "edges":
        return edgesScene;

      default:
        return systemair;
    }
  })();

  const theme = React.useContext(ThemeContext);
  const themedModel = React.useMemo(
    () => getThemedScene(roundBoxes(typed ? assignMaterialTypes(selectedModel) : selectedModel), theme),
    [selectedModel, typed, theme]
  );

  const viewerProps: React3Js.ViewerProps = {
    sceneFallback,
    useAlphaTest: false,
    selectedIds: {},
    fitPadding: 0.15,
    quality,
    groundShadow,
    shadows,
    scene: themedModel,
    showDimensions: true,
    camera,
    controlsHelper,
    controls: orbitContolProps,
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
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ padding: 8 }}>
          <label>
            Camera:
            <select value={cameraType} onChange={(e) => setCameraType(e.target.value as "Perspective" | "Orthographic")} style={{ marginLeft: 8 }}>
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
              <option value="materials">Materials</option>
              <option value="edges">Rounded edges</option>
            </select>
          </label>
        </div>

        <div style={{ padding: 8 }}>
          <label>
            Quality:
            <select value={quality} onChange={(e) => setQuality(e.target.value as React3Js.Quality)} style={{ marginLeft: 8 }}>
              <option value="auto">Auto</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        <div style={{ padding: 8 }}>
          <label>
            Shadow:
            <select value={groundShadow ? "on" : "off"} onChange={(e) => setGroundShadow(e.target.value === "on")} style={{ marginLeft: 8 }}>
              <option value="on">On</option>
              <option value="off">Off</option>
            </select>
          </label>
        </div>
        <div style={{ padding: 8 }}>
          <label>
            Self shadows:
            <select value={shadows ? "on" : "off"} onChange={(e) => setShadows(e.target.value === "on")} style={{ marginLeft: 8 }}>
              <option value="on">On</option>
              <option value="off">Off</option>
            </select>
          </label>
        </div>
        <div style={{ padding: 8 }}>
          <label>
            Studio:
            <select value={studio} onChange={(e) => setStudio(e.target.value as typeof studio)} style={{ marginLeft: 8 }}>
              <option value="on">On</option>
              <option value="off">Off, ~400 ms quicker first load</option>
              <option value="compare">Side by side, on and off</option>
            </select>
          </label>
        </div>
        <div style={{ padding: 8 }}>
          <label>
            Material types:
            <select value={typed ? "on" : "off"} onChange={(e) => setTyped(e.target.value === "on")} style={{ marginLeft: 8 }}>
              <option value="on">On</option>
              <option value="off">Off (as authored)</option>
            </select>
          </label>
        </div>
      </div>

      {/* 3D + overlays container */}
      <div
        style={{
          position: "relative",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {studio !== "compare" && (
          <>
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
          </>
        )}

        {/* 3D VIEW */}
        {studio === "compare" ? (
          <div style={{ display: "flex", gap: 4, width: "100%", height: "100%" }}>
            <Viewer {...viewerProps} studio={true} style={{ flex: 1, backgroundColor: "var(--viewer)" }} />
            <Viewer {...viewerProps} studio={false} style={{ flex: 1, backgroundColor: "var(--viewer)" }} />
          </div>
        ) : (
          <Viewer
            {...viewerProps}
            studio={studio === "on"}
            bufferZones={{ left: left, right: right, top: top, bottom: bottom }}
            style={{ backgroundColor: "var(--viewer)" }}
          />
        )}
      </div>
    </div>
  );
}
