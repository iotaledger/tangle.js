const path = require("path");
const CopyWebPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

const clientConfig = {
  target: "web",
  entry: "./init.js",
  resolve: {
    extensions: [".js"],
    alias: {
      "@tangle-js/anchors": path.resolve(
        __dirname,
        "../node_modules/@tangle-js/anchors/dist/web/anchors-web.js"
      ),
      "@tangle-js/ld-proofs": path.resolve(
        __dirname,
        "../node_modules/@tangle-js/ld-proofs/dist/web/ld-proofs-web.js"
      ),
      "epcis2.js": path.resolve(
        __dirname,
        "../node_modules/epcis2.js/dist/epcis2.browser.js"
      )
    },
    fallback: {
      buffer: require.resolve("buffer/")
    }
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
      type: "module"
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"]
    }),
    new CopyWebPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "./index.html"),
          to: path.resolve(__dirname, "dist"),
        },
      ]
    }),
    new CopyWebPlugin({
      patterns: [
        {
          from: path.resolve(
            __dirname,
            "../node_modules/@tangle.js/streams-wasm/web/streams_bg.wasm"
          ),
          to: path.resolve(__dirname, "dist/public/wasm")
        },
        {
          from: path.resolve(
            __dirname,
            "../node_modules/@iota/identity-wasm/web/identity_wasm_bg.wasm"
          ),
          to: path.resolve(__dirname, "dist/public/wasm")
        },
      ]
    })
  ]
};

module.exports = [clientConfig];
