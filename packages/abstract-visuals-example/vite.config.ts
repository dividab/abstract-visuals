import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const analyze = process.env.ANALYZE === "1";

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
    ...(analyze
      ? [
          visualizer({
            open: true,
            gzipSize: false,
            brotliSize: false,
          }) as PluginOption,
        ]
      : []),
  ],
  // abstract-image is a depency of abstract-chart and abstract-document.
  optimizeDeps: { include: ["abstract-image", "handlebars-xml", "jsxpression"] },
});
