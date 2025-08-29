export type zOrderElement = { readonly element: string; readonly zOrder: number };
export const zElem = (element: string, zOrder: number): zOrderElement => ({ element, zOrder });

export const stBW = 0.7;
export const stN = 0.1;

export const gray = "rgb(85, 85, 85)";
export const white = "rgb(255, 255, 255)";
export const transparent = "rgba(255, 255, 255, 0)";
export const black = "rgb(15, 15, 15)";

export type ImageDataUri =
  | `data:image/png;base64,${string}`
  | `data:image/jpeg;base64,${string}`
  | `data:image/svg+xml,${string}`;
