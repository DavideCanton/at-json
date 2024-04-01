//@ts-check

const path = require('path');
const pkg = require('./package.json');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const isDev = process.env.NODE_ENV == 'development';

/**@type {import('webpack').Configuration}*/
module.exports.common = {
    entry: './lib/index.ts',
    plugins: [
        isDev
            ? new BundleAnalyzerPlugin({
                  openAnalyzer: false,
                  analyzerMode: 'static',
              })
            : false,
    ],
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
};

/**@type {import('webpack').Configuration}*/
module.exports.cjs = {
    output: {
        filename: 'index.cjs',
        path: path.resolve(__dirname, 'dist/cjs'),
        library: {
            type: 'commonjs',
        },
        globalObject: 'this',
    },
};

/**@type {import('webpack').Configuration}*/
module.exports.esm = {
    // make the user bundle it
    mode: "development",
    output: {
        filename: 'index.mjs',
        path: path.resolve(__dirname, 'dist/esm'),
        library: {
            type: 'module',
        },
    },
    experiments: {
        outputModule: true,
    },
};
