/* oxlint-disable no-console -- prints the render times */
import { writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { createServer } from "vite";
import type { SvgOptions } from "../src/renderers/svg/svg-geometries/shared.js";
import type { render as Render } from "../src/renderers/svg/svg.js";
import type { scenes as Scenes } from "./scenes.js";

/**
 * Renders a scene with the svg renderer, in color and as a sketch, front and three-quarter from both sides, to bench/out as svg and png, timing each.
 * Usage: node packages/abstract-3d/bench/svg.ts [scene], e.g. systemair3
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "bench", "out");
const name = process.argv[2] ?? "systemair3";
const sketch = { only_stroke: true, stroke_thickness: 3, background: "rgb(255,255,255)" } as const;
const views: Record<string, Partial<SvgOptions>> = {
  front: {},
  "front-sketch": sketch,
  "top-left": { view: "TopLeft" },
  "top-left-sketch": { view: "TopLeft", ...sketch },
  "top-right": { view: "TopRight" },
  "top-right-sketch": { view: "TopRight", ...sketch },
};

// Through vite, which resolves the sources' .js imports to their .ts files
const server = await createServer({ root, configFile: false, logLevel: "error", server: { middlewareMode: true } });
const { render } = (await server.ssrLoadModule("/src/renderers/svg/svg.ts")) as { readonly render: typeof Render };
const { scenes } = (await server.ssrLoadModule("/bench/scenes.ts")) as { readonly scenes: typeof Scenes };
const browser = await chromium.launch({ executablePath: join(homedir(), ".cache/ms-playwright/chromium-1243/chrome-linux64/chrome") });
for (const [view, options] of Object.entries(views)) {
  const start = performance.now();
  const { image, width, height } = render(scenes[name]!, options);
  console.log(`${view}: ${Math.round(performance.now() - start)} ms, ${Math.round(image.length / 1024)} kB`);
  writeFileSync(join(out, `${name}-${view}.svg`), image);
  const page = await browser.newPage({ viewport: { width: 1400, height: Math.round((1400 * height) / width) } });
  await page.setContent(`<body style="margin:0;background:white">${image.replace("<svg", '<svg style="width:100%;height:auto"')}</body>`);
  await page.screenshot({ path: join(out, `${name}-${view}.png`) });
  await page.close();
}
await browser.close();
await server.close();
console.log(`in ${out}`);
