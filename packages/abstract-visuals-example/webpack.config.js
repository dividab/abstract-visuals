const path = require("path");

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  stats: "errors-warnings",
  context: path.resolve(__dirname, "./src"),
  entry: ["@babel/polyfill", "./text-encoder-polyfill", "./app/start"],
  output: {
    filename: "bundle.js",
  },
  output: {
    path: path.join(__dirname, "./dist"),
    filename: "example-bundle.js",
    // the url to the output directory resolved relative to the HTML page
    publicPath: "/assets/",
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" },
    ],
  },
};
