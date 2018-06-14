// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.

const atl = require("awesome-typescript-loader");

// load the default config generator.
const genDefaultConfig = require("@storybook/react/dist/server/config/defaults/webpack.config.js");

const path = require("path");

const tsconfigPath = path.resolve(__dirname, "../stories/tsconfig.json");

module.exports = (baseConfig, env) => {
  const config = genDefaultConfig(baseConfig, env);

  // Extend it as you need.

  // For example, add typescript loader:
  config.module.rules.push({
    test: /\.tsx?$/,
    loader: "ts-loader",
    options: {
      configFile: tsconfigPath
    }
  });
  config.resolve.extensions.push(".ts", ".tsx");
  // console.log(JSON.stringify(config));
  if (!config.resolve.plugins) {
    config.resolve.plugins = [];
  }
  config.resolve.plugins.push(
    new atl.TsConfigPathsPlugin({ configFileName: tsconfigPath })
  );
  // config.resolve.extensions.push = {
  //   extensions: [".ts", ".tsx"],
  //   plugins: [
  //     new atl.TsConfigPathsPlugin({ configFileName: "./src/client/tsconfig.json" })
  //   ]
  // };
  return config;
};
