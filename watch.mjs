import * as esbuild from "esbuild";

async function main() {
    const contextOne = await esbuild.context({
        entryPoints: ["src/index.ts"],
        bundle: true,
        outfile: "dist/bundle.js",
    });

    await contextOne.watch();

    console.log("Watching for changes...");
}

main();