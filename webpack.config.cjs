//@ts-check
const { merge } = require('webpack-merge');

const path = require('path');

// const isDev = process.env.NODE_ENV == 'development';

/**@type {import('webpack').Configuration}*/
const common = {
    entry: './lib/index.ts',
    mode: 'none',
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
