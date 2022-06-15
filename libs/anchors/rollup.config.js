import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import packageDetails from "./package.json";
import copy from "rollup-plugin-copy";

const plugins = [
  commonjs({
    ignoreDynamicRequires: true,
  }),
  resolve({
    preferBuiltins: true,
    browser: process.env.BROWSER,
  }),
  copy({
    targets: [
      { src: '../../node_modules/@tangle.js/streams-wasm/node/streams_bg.wasm', dest: 'dist/cjs' }
    ]
  })
];

const globs = {};
for (const dep in packageDetails.dependencies) {
  globs[dep] = dep;
}

export default {
  inlineDynamicImports: true,
  input: `./es/index.js`,
  output: {
    file: `dist/cjs/index.cjs`,
    format: "cjs",
    name: packageDetails.name
      .split("-")
      .map((p) => p[0].toUpperCase() + p.slice(1))
      .join(""),
    compact: false,
    sourcemap: "inline",
    exports: "auto",
    globals: globs,
  },
  external: ["fs/promises"].concat(Object.keys(globs)),
  onwarn: (message) => {
    if (!["EMPTY_BUNDLE"].includes(message.code)) {
      console.error(message);
      process.exit(1);
    }
  },
  plugins,
};
