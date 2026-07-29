import buildEsBuild from "fmko-ts-esbuild";

buildEsBuild({
    entryPoints: [
        {in: "./src/main/ts/index.ts", out: "fsk"}
    ],
    outDir: "./target/js",
    lintOptions: {
        fix: false
    },
    sourcemap: "linked"
});
