const webpack = require("webpack");
const merge = require("webpack-merge");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const baseConfig = require("./base.config.js");

module.exports = merge(baseConfig, {
  context: `${process.cwd()}/client`,
  mode: "production",
  devtool: "source-map",
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [`${process.cwd()}/dist`]
    }),
    new webpack.HashedModuleIdsPlugin()
  ],
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  },
  output: {
    path: `${process.cwd()}/dist`,
    filename: "[name].[contenthash].js",
    publicPath: "/"
  }
});