'use strict';

const base = require('fmko-typescript-build');
const webpack = require('webpack');

const baseConfig = base.webpack.dev({
    entry: './src/main/ts/index.ts',
    output: {
        filename: 'target/js/fmkoddv.js'
    },
    devtool: 'source-map'
});

baseConfig.plugins = [].concat(baseConfig.plugins).concat([
    new webpack.DefinePlugin({
        IE8: false
    })
]);

module.exports = baseConfig;
