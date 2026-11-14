import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/aussie-atis-card.ts",
  output: {
    file: "dist/aussie-atis-card.js",
    format: "es",
    inlineDynamicImports: true,
  },
  plugins: [
    nodeResolve(),
    json({ compact: true }),
    typescript({ tsconfig: "./tsconfig.json", include: ["src/**/*.ts"] }),
    terser({ format: { comments: false } }),
  ],
};
