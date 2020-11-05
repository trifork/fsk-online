"use strict";

const webpack = require("fmko-ts-build");

module.exports = (_, options) => webpack.buildTemplate({
    options,
    entry: "./src/main/ts/index.ts",
    outputPath: __dirname + "/",
    fileName: "target/js/fsk.js",
    devtool: "source-map",
    copyConfig: [
        {from: "src/main/webapp/css", to: "target/css/"}
    ],
    esLintOptions: {
        context: __dirname,
        files: "src/main/ts",
        fix: true,
        eslintPath: `${__dirname}/node_modules/eslint`
    },
    aliases: {
        moment$: `${__dirname}/node_modules/moment/moment.js`
    },
    bundleName: "fsk",
    watchOptions: options.watch ? {ignored: [`${__dirname}/node_modules/**`]} : undefined
});
