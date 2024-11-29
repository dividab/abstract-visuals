import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// eslint-disable-next-line import/no-default-export
export default defineConfig({ plugins: [react(), nodePolyfills()] });