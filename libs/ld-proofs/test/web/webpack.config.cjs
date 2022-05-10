const path = require("path");
const CopyWebPlugin = require("copy-webpack-plugin");

const clientConfig = {
  target: "web",
  entry: "./init.js",
  resolve: {
    extensions: [".js"],
    alias: {
      "@tangle-js/anchors": path.resolve(__dirname, "../../../anchors/dist/web/anchors-web.js"),
      "@tangle-js/ld-proofs": path.resolve(__dirname, "../../dist/web/ld-proofs-web.js")
    },
  },
  experiments: {
    topLevelAwait: true,
    outputModule: true,
    syncWebAssembly: true
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    library: {
      type: "module",
    },
  },
  plugins: [
    new CopyWebPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "./index.html"),
          to: path.resolve(__dirname, "dist"),
        },
      ],
    }),
    new CopyWebPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "../../../../node_modules/@iota/streams/web/streams_bg.wasm"),
          to: path.resolve(__dirname, "dist/public/wasm"),
        },
        {
          from: path.resolve(__dirname, "../../../../node_modules/@iota/identity-wasm/web/identity_wasm_bg.wasm"),
          to: path.resolve(__dirname, "dist/public/wasm"),
        },
      ],
    }),
  ]
};

module.exports = [clientConfig];
