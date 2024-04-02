//@ts-check
const { merge } = require('webpack-merge');

const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const isDev = process.env.NODE_ENV == 'development';

/**@type {import('webpack').Configuration}*/
const common = {
    entry: './lib/index.ts',
    mode: 'none',
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
const cjs = {
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
const esm = {
    // make the user bundle it
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

module.exports = [merge(common, cjs), merge(common, esm)];
