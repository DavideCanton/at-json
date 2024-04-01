const { merge } = require('webpack-merge');
const { common, cjs, esm } = require('./webpack.common.cjs');

module.exports = [
    merge(
        common,
        {
            mode: 'development',
        },
        cjs
    ),
    merge(common, esm),
];
