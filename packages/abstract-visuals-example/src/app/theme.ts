import React from "react";
import type { Scene } from "../../../abstract-3d/src/abstract-3d.js";

/** The examples' light or dark theme: CSS variables on the root element style the page, and 3D scenes get light dimensions, which CSS can't reach */

export type Theme = "light" | "dark";

export const ThemeContext = React.createContext<Theme>("light");

const darkDimensionColor = "rgb(220, 224, 230)";

/** The scene as authored in the light theme, with light dimensions in the dark one; memoize it, as a new scene rebuilds the viewer */
export function getThemedScene(scene: Scene, theme: Theme): Scene {
  const dimensions = scene.dimensions_deprecated;
  return theme === "light" || !dimensions
    ? scene
    : { ...scene, dimensions_deprecated: { ...dimensions, material: { ...dimensions.material, normal: darkDimensionColor } } };
}
