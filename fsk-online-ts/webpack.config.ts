import {WebpackBuild} from "fmko-ts-build/ts";

export default (_: any, options: any) => WebpackBuild.buildTemplate({
    options,
    entry: "./src/main/ts/index.ts",
    outputPath: __dirname + "/",
    fileName: "target/js/fsk.js",
    devtool: "source-map",
    esLintOptions: {
        context: __dirname,
        files: "src/main/ts",
        fix: true,
        eslintPath: `${__dirname}/node_modules/eslint`
    },
    copyConfig: [
        {from: "src/main/webapp/css", to: "target/css/"}
    ],
    aliases: {
        moment$: `${__dirname}/node_modules/moment/moment.js`
    },
    bundleName: "fsk"
});
