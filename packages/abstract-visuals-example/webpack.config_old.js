const path = require("path");
const atl = require("awesome-typescript-loader");

module.exports = {
  // context - The base directory, an absolute path, for resolving entry points and loaders from configuration.
  stats: "minimal",
  context: path.resolve(__dirname, "./src"),
  devtool: "sourcemap",
  entry: ["@babel/polyfill", "./text-encoder-polyfill", "./app/start"],
  output: {
    path: path.join(__dirname, "../dist/example"),
    filename: "example-bundle.js",
    // the url to the output directory resolved relative to the HTML page
    publicPath: "/assets/",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader",
        exclude: /^node_modules/,
        query: {
          configFileName: "./tsconfig.json",
        },
      },
    ],
  },
  node: {
    fs: "empty",
  },
  performance: {
    hints: false,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    plugins: [
      new atl.TsConfigPathsPlugin({
        configFileName: "./src/client/tsconfig.json",
      }),
    ],
  },
  plugins: [new atl.CheckerPlugin()],
  devServer: {
    stats: {
      assets: false,
      hash: false,
      chunks: false,
      errors: true,
      errorDetails: true,
    },
    overlay: true,
  },
};
