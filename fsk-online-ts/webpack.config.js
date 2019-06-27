'use strict';

const webpack = require('fmko-typescript-build');

module.exports = (_, options) => webpack.buildTemplate({
    options,
    entry: './src/main/ts/index.ts',
    outputPath: __dirname + '/',
    fileName: 'target/js/fsk.js',
    devtool: 'source-map',
    tsLintPath: undefined, // 'tslint.json', too many errors
    copyConfig: [
        {from: 'src/main/webapp/css', to: `target/css/`}
    ],
    aliases: {
        moment$: `${__dirname}/node_modules/moment/moment.js`
    }
});
