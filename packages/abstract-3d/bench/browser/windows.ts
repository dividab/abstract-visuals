/* oxlint-disable no-console -- prints the results */
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

/**
 * Startup on the real GPU, which run.ts's software rendering can't show, as shaders compile in the GPU's driver: the bench page in Windows' Chrome,
 * started from WSL, posting its times back; cold, in a new profile, and warm, with the shaders cached. Takes queries for main.ts, each run 5 times.
 * Usage: node packages/abstract-3d/bench/browser/windows.ts "scene=systemair3" "scene=systemair3&shadows=off"
 */

const root = dirname(fileURLToPath(import.meta.url));
const runs = 5;
const profile = "a3d-startup-probe";
const queries = process.argv.length > 2 ? process.argv.slice(2) : ["scene=systemair3"];

type Report = {
  readonly loadedMs: number;
  readonly firstFrameMs: number;
  readonly programs: number;
  readonly gpu: string;
  readonly parallelCompile: boolean;
};
const reports: Array<(report: Report) => void> = [];

const server = await createServer({
  root,
  configFile: false,
  logLevel: "error",
  // Reachable from Windows, as WSL forwards its localhost
  server: { port: 5199, host: "0.0.0.0" },
  plugins: [
    {
      name: "report",
      configureServer: (s) => {
        s.middlewares.use("/report", (req, res) => {
          let body = "";
          req.on("data", (chunk: string) => (body += chunk));
          req.on("end", () => {
            res.end();
            reports.shift()?.(JSON.parse(body) as Report);
          });
        });
      },
    },
  ],
});
await server.listen();

const powershell = (command: string): string => execFileSync("powershell.exe", ["-NoProfile", "-Command", command], { encoding: "utf8" });
// Stopping the WSL side doesn't stop Windows' processes, so they're found by their profile
const stopChrome = (): string =>
  powershell(
    `Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -like '*${profile}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`
  );
const median = (values: ReadonlyArray<number>): number => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] ?? 0;

// Cold: a deleted profile, as a first visit; warm: the same profile again, whose disk cache has the compiled shaders, as a returning visit
const rows = [];
const gpus = new Set<string>();
for (const query of queries) {
  const [cold, warm]: [Array<Report>, Array<Report>] = [[], []];
  for (const _ of Array.from({ length: runs })) {
    powershell(`Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "$env:TEMP\\${profile}"; exit 0`);
    const first = await load(query);
    const second = first && (await load(query));
    if (first && second) {
      cold.push(first);
      warm.push(second);
      gpus.add(`${first.gpu}, parallel compile: ${first.parallelCompile}`);
    }
  }
  rows.push({
    query,
    coldMs: Math.round(median(cold.map((t) => t.firstFrameMs))),
    warmMs: Math.round(median(warm.map((t) => t.firstFrameMs))),
    programs: cold[0]?.programs ?? 0,
  });
}
console.log([...gpus].join("\n"));
console.table(rows);
await server.close();

/** The page's report, or undefined if none came within 45 s */
async function load(query: string): Promise<Report | undefined> {
  const report = new Promise<Report | undefined>((resolve) => {
    reports.push(resolve);
    setTimeout(() => resolve(undefined), 45_000);
  });
  powershell(
    `Start-Process -FilePath "$env:ProgramFiles\\Google\\Chrome\\Application\\chrome.exe" -ArgumentList '--headless=new',"--user-data-dir=$env:TEMP\\${profile}",'--no-first-run','--window-size=1280,720','http://localhost:5199/index.html?report&quality=high&${query}'`
  );
  const result = await report;
  stopChrome();
  if (!result) {
    reports.shift();
    console.error(`${query}: no report within 45 s`);
  }
  return result;
}
