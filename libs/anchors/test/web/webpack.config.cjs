const path = require("path");
const CopyWebPlugin = require("copy-webpack-plugin");

const clientConfig = {
  target: "web",
  entry: "./init.js",
  resolve: {
    extensions: [".js"],
    alias: {
      "anchors-web.js": path.resolve(__dirname, "../../dist/anchors-web.js"),
    },
  },
  experiments: {
    topLevelAwait: true,
    outputModule: true
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
          from: path.resolve(__dirname, "../../../../node_modules/@iota/streams/web"),
          to: path.resolve(__dirname, "dist"),
        },
      ],
    }),
  ],
  experiments: {
    outputModule: true,
    syncWebAssembly: true
  },
};

module.exports = [clientConfig];
