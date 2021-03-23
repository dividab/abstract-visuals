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
    extensions: [".ts", ".tsx", ".js"],
    fallback: { stream: false, path: false },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            projectReferences: true,
          },
        },
      },
    ],
  },
};
