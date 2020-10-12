const path = require("path");
const pkg = require("./package.json");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const pathParsed = path.parse(pkg.main);

module.exports = (env) => {
  env = env || {};

  return {
    mode: "production",
    entry: "./lib/index.ts",
    output: {
      path: path.resolve(__dirname, pathParsed.dir),
      filename: pathParsed.base,
      libraryTarget: 'umd'
    },
    plugins: [...(env.analyze ? [new BundleAnalyzerPlugin()] : [])],
    devtool: "source-map",
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
      extensions: [".tsx", ".ts", ".js"],
    },
  };
};
