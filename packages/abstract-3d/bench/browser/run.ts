/* oxlint-disable no-console -- prints the results and the page's errors */
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "playwright-core";
import { createServer } from "vite";

/**
 * Browser benchmark and screenshots of the three.js viewer, in headless Chromium with a software GPU, so frame times measure the CPU side only.
 * Usage: node packages/abstract-3d/bench/browser/run.ts [bench] [memory] [screenshots] [studio]
 */

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, "..", "out");
const modes = process.argv.slice(2);
const runs = (mode: string): boolean => modes.length === 0 || modes.includes(mode);

const server = await createServer({ root, configFile: false, logLevel: "error", server: { port: 5199 } });
await server.listen();
const browser = await chromium.launch({
  executablePath: join(homedir(), ".cache/ms-playwright/chromium-1243/chrome-linux64/chrome"),
  args: [
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--enable-precise-memory-info",
    "--js-flags=--expose-gc",
  ],
});

type Stats = {
  readonly loaded: boolean;
  readonly frameMs: number;
  readonly drawCalls: number;
  readonly pickMs: number;
  readonly paintMs: number;
  readonly frames: number;
};
const getStats = (page: Page): Promise<Stats> => page.evaluate(() => ({ ...window.harness.viewer.stats, loaded: window.harness.viewer.loaded }));
const median = (values: ReadonlyArray<number>): number => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] ?? 0;

async function open(query: Record<string, string>, width = 1280, height = 720): Promise<{ readonly page: Page; readonly readyMs: number }> {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on("pageerror", (e) => console.error("page error:", e.message));
  page.on("console", (m) => m.type() === "error" && console.error("console:", m.text()));
  await page.goto(`http://localhost:5199/index.html?${new URLSearchParams(query).toString()}`);
  await page.waitForFunction(() => "harness" in window && window.harness.viewer.loaded, undefined, { timeout: 120_000 });
  const readyMs = await page.evaluate(() => performance.now() - window.harness.created);
  // Settle: let frames at rest finish
  await page.waitForTimeout(500);
  return { page, readyMs };
}

async function drag(page: Page, steps: number): Promise<ReadonlyArray<Stats>> {
  const samples: Array<Stats> = [];
  await page.mouse.move(640, 360);
  await page.mouse.down();
  for (let i = 0; i < steps; i++) {
    await page.mouse.move(640 + Math.sin(i / 10) * 200, 360 + Math.cos(i / 15) * 60);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    samples.push(await getStats(page));
  }
  await page.mouse.up();
  return samples;
}

async function hover(page: Page, count: number): Promise<ReadonlyArray<number>> {
  const times: Array<number> = [];
  for (let i = 0; i < count; i++) {
    await page.mouse.move(200 + ((i * 97) % 880), 250 + ((i * 53) % 220));
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const stats = await getStats(page);
    times.push(stats.pickMs + stats.paintMs);
  }
  return times;
}

if (runs("bench")) {
  const rows = [];
  for (const copies of [1, 4, 9]) {
    const { page, readyMs } = await open({ scene: "systemair3", copies: String(copies), quality: "low" });
    const atRest = await getStats(page);
    const moving = await drag(page, 60);
    const hovers = await hover(page, 30);
    const heapMb = await page.evaluate(() => {
      (window as unknown as { gc?: () => void }).gc?.();
      return (performance as unknown as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize / 1e6;
    });
    rows.push({
      copies,
      readyMs: Math.round(readyMs),
      drawCalls: atRest.drawCalls,
      frameCpuMs: Number(median(moving.slice(5).map((s) => s.frameMs)).toFixed(2)),
      hoverMs: Number(median(hovers).toFixed(2)),
      heapMb: Math.round(heapMb),
    });
    await page.close();
  }
  console.table(rows);
}

// Frames rendered while idle, which render on demand keeps at 0, then GPU resources and heap after swapping scenes, which should stay flat
if (runs("memory")) {
  const { page } = await open({ scene: "systemair3" });
  const frames = await page.evaluate(async () => {
    const before = window.harness.viewer.stats.frames;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return window.harness.viewer.stats.frames - before;
  });
  console.log(`frames rendered in 2 s idle: ${frames}`);
  const rows = [];
  const names = ["systemair6", "demo", "systemair3"];
  for (const swaps of Array.from({ length: 151 }, (_, i) => i)) {
    if (swaps % 30 === 0) {
      rows.push({
        swaps,
        ...(await page.evaluate(() => {
          (window as unknown as { gc?: () => void }).gc?.();
          const { renderer } = window.harness.viewer;
          return {
            geometries: renderer.info.memory.geometries,
            textures: renderer.info.memory.textures,
            programs: renderer.info.programs?.length ?? 0,
            heapMb: Math.round((performance as unknown as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize / 1e6),
          };
        })),
      });
    }
    await page.evaluate((name) => window.harness.swap(name), names[swaps % names.length]!);
    await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 150)));
  }
  console.table(rows);
  await page.close();
}

if (runs("screenshots")) {
  mkdirSync(out, { recursive: true });
  const shots: ReadonlyArray<readonly [string, Record<string, string>]> = [
    ...["demo", "systemair3", "systemair6"].flatMap((scene) =>
      ["Perspective", "Orthographic"].flatMap((camera) =>
        ["front", "top"].map((view): readonly [string, Record<string, string>] => [`${scene}-${camera}-${view}`, { scene, camera, view }])
      )
    ),
    ["systemair3-high", { scene: "systemair3", quality: "high" }],
    ["systemair3-low", { scene: "systemair3", quality: "low" }],
    ["systemair3-axes", { scene: "systemair3", gizmo: "axes" }],
  ];
  for (const [name, query] of shots) {
    const { page } = await open(query);
    await page.screenshot({ path: join(out, `${name}.png`) });
    await page.close();
  }
  const { page } = await open({ scene: "systemair3" });
  await drag(page, 20);
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(out, "systemair3-orbit.png") });
  await page.mouse.move(640, 360);
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(out, "systemair3-hover.png") });
  await page.mouse.click(640, 360);
  await page.mouse.move(10, 10);
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(out, "systemair3-selected.png") });
  await page.close();
  // The viewcube's center is 80 px from the bottom right corner; a click on its front face's top edge looks from the front and above
  const { page: gizmoPage } = await open({ scene: "systemair3" });
  await gizmoPage.mouse.click(1280 - 80, 720 - 80 - 36);
  await gizmoPage.waitForTimeout(1500);
  await gizmoPage.screenshot({ path: join(out, "systemair3-gizmo-click.png") });
  await gizmoPage.close();
  writeFileSync(join(out, "README.txt"), "Screenshots of the last `pnpm bench:abstract-3d:browser screenshots` run\n");
  console.log(`screenshots in ${out}`);
}

if (runs("studio")) {
  // The same orbited view lit by the studio and by its three-point emulation, to compare
  mkdirSync(out, { recursive: true });
  for (const scene of ["demo", "systemair3"]) {
    for (const studio of ["on", "off"]) {
      const { page } = await open({ scene, studio });
      await drag(page, 12);
      await page.waitForTimeout(800);
      await page.screenshot({ path: join(out, `${scene}-studio-${studio}.png`) });
      await page.close();
    }
  }
  console.log(`screenshots in ${out}`);
}

await browser.close();
await server.close();
