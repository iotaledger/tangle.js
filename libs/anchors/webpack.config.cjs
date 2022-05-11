const path = require("path");
const webpack = require("webpack");

const clientConfig = {
  target: "web",
  devtool: "source-map",
  entry: ["./src/index.ts"],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: {
          configFile: "tsconfig.json",
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@iota/streams/node/streams.cjs": path.resolve(
        __dirname,
        "../../node_modules/@iota/streams/web/streams.mjs"
      ),
    },
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      buffer: require.resolve("buffer/"),
      stream: require.resolve("stream-browserify"),
    },
  },
  output: {
    filename: "anchors-web.js",
    path: path.resolve(__dirname, "dist/web"),
    libraryTarget: "module",
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
  experiments: {
    topLevelAwait: true,
    outputModule: true,
    syncWebAssembly: true,
  },
};

module.exports = [clientConfig];
