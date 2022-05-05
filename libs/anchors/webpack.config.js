const path = require("path");
const glob = require("glob");

const clientConfig = {
  target: "web",
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@tangle.js/streams-wasm/node": path.resolve(
        __dirname,
        "../../node_modules/@tangle.js/streams-wasm/web/streams_wasm.js"
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
    path: path.resolve(__dirname, "dist"),
    library: {
      name: "anchors",
      type: "module",
      exports: "default"
    }
  },
  experiments: {
    topLevelAwait: true,
    outputModule: true
  },
};

module.exports = [clientConfig];
