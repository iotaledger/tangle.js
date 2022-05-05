import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import { terser } from "rollup-plugin-terser";
import packageDetails from "./package.json";

const plugins = [
    replace({
        "process.env.BROWSER": !!process.env.BROWSER,
        preventAssignment: true
    }),
    commonjs({
        ignoreDynamicRequires: true
    }),
    resolve({
        preferBuiltins: true,
        browser: process.env.BROWSER
    })
];

if (process.env.MINIFY) {
    plugins.push(terser());
}

const globs = {};
for (const dep in packageDetails.dependencies) {
    globs[dep] = dep;
}

export default {
    input: `./es/index.js`,
    output: {
        file: `dist/index${process.env.MINIFY ? ".min" : ""}.js`,
        format: "cjs",
        name: packageDetails.name
            .split("-")
            .map(p => p[0].toUpperCase() + p.slice(1))
            .join(""),
        compact: process.env.MINIFY,
        exports: "auto",
        globals: globs
    },
    external: ["fs/promises"].concat(Object.keys(globs)),
    plugins
};
