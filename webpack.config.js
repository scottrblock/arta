const fs = require("fs");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

const extensions = fs.readdirSync("./src/entries/");
const entry = Object.fromEntries(
  extensions.map((e) => [e.substring(0, e.length - 3), `./src/entries/${e}`])
);

module.exports = {
  entry,
  resolve: {
    extensions: [".ts", ".js"],
  },
  mode: "production",
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimizer: [
    new TerserPlugin({
      extractComments: /@extract/i,
    })]
  },
  performance: {
    maxEntrypointSize: 280000,
    maxAssetSize: 280000,
  },
};
