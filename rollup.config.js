import { defineConfig } from "rollup";
import resolvePlugin from "@rollup/plugin-node-resolve";
import commonjsPlugin from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import path from "node:path";

const root = path.resolve("./src");
export default defineConfig({
  input: "src/main.js",
  plugins: [resolvePlugin(), commonjsPlugin(), terser({ keep_fnames: true, keep_classnames: true, mangle: false })],
  output: {
    dir: "dist",
    chunkFileNames: "[name].mjs",
    entryFileNames: "main.mjs",
    compact: true,
    manualChunks(id, meta) {
      if (!id.startsWith(root)) return "deps";
      else return "main";
    },
  },
});
