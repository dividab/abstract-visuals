/* oxlint-disable no-console -- prints the results */
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { createServer } from "vite";

const root = dirname(fileURLToPath(import.meta.url));
const server = await createServer({ root, configFile: false, logLevel: "error", server: { port: 5198 } });
await server.listen();
const browser = await chromium.launch({
  executablePath: join(homedir(), ".cache/ms-playwright/chromium-1243/chrome-linux64/chrome"),
  args: [
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--enable-unsafe-webgpu",
    "--use-webgpu-adapter=swiftshader",
    "--ignore-gpu-blocklist",
    "--disable-gpu-sandbox",
  ],
});
const rows = [];
for (const copies of [1, 4, 9]) {
  for (const backend of ["webgl", "webgpu-gl", "webgpu"]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    page.on("pageerror", (e) => console.error(backend, "page error:", e.message));
    await page.goto(`http://localhost:5198/index.html?backend=${backend}&copies=${copies}`);
    // A lost GPU device, as SwiftShader's WebGPU loses it under WSL, leaves the page without a result
    const done = await page
      .waitForFunction(() => "result" in window, undefined, { timeout: 60_000 })
      .then(
        () => true,
        () => false
      );
    rows.push({ copies, ...(done ? await page.evaluate(() => (window as unknown as { result: object }).result) : { backend, error: "no result" }) });
    await page.close();
  }
}
console.table(rows);
await browser.close();
await server.close();
