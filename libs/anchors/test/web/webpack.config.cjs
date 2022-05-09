const path = require("path");
const CopyWebPlugin = require("copy-webpack-plugin");

const clientConfig = {
  target: "web",
  entry: "./init.js",
  resolve: {
    extensions: [".js"],
    alias: {
      "anchors-web.js": path.resolve(__dirname, "../../dist/anchors-web.js"),
      "@iota/streams/node": path.resolve(__dirname, "../../../../node_modules/@iota/streams/web"),
      "@iota/streams/web": path.resolve(__dirname, "../../../../node_modules/@iota/streams/web"),
      "@iota/streams/web/streams.js": path.resolve(__dirname, "../../../../node_modules/@iota/streams/web/streams.js")
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
          to: path.resolve(__dirname, "dist/wasm"),
        },
      ],
    }),
  ]
};

module.exports = [clientConfig];
