// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable no-console */
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "fs/promises";
import path from "path";

/**
 * The main entry point for the CLI.
 */
export class CLI {
    /**
     * Run the app.
     * @param argv The process arguments.
     * @returns The exit code.
     */
    public async run(argv: string[]): Promise<number> {
        console.log("ESM Modules");
        console.log("===========");
        console.log("");

        if (argv.length < 4) {
            console.log("Usage:");
            console.log("\tesm-modules <es-dir> <mjs-dir> [--remove-src]");
            if (argv.length < 3) {
                console.error("Error: You must specify the src directory");
            } else if (argv.length < 4) {
                console.error("Error: You must specify the es directory");
            }
            return 1;
        }

        const esDir = path.resolve(argv[2]);
        const mjsDir = path.resolve(argv[3]);
        const remove = argv[4] === "--remove-src";

        try {
            console.log("Es Directory:", esDir);
            console.log("Mjs Directory:", mjsDir);
            console.log();

            await this.process(esDir, mjsDir, "", remove);
        } catch (err) {
            console.error(err);
            return 1;
        }

        return 0;
    }

    /**
     * Process all the modules in the directory.
     * @param esDirBase The base es directory.
     * @param mjDirBase The base mjs directory.
     * @param srcRelativeDir The source relative directory.
     * @param removeOriginal Remove the original source.
     * @internal
     */
    private async process(
        esDirBase: string,
        mjDirBase: string,
        srcRelativeDir: string,
        removeOriginal: boolean
    ): Promise<void> {
        const entries = await readdir(path.join(esDirBase, srcRelativeDir));

        for (const entry of entries) {
            const relativeEntry = path.join(srcRelativeDir, entry);
            const fullEntrySrc = path.join(esDirBase, relativeEntry);
            const fullEntryDest = path.join(mjDirBase, relativeEntry.replace(".js", ".mjs"));
            const st = await stat(path.join(fullEntrySrc));

            if (st.isFile() && path.extname(fullEntrySrc) === ".js") {
                console.log("Processing File", fullEntrySrc);

                let content = await readFile(fullEntrySrc, "utf8");
                // eslint-disable-next-line @typescript-eslint/quotes
                content = content.replace(/import(.*)"\.(.*)";/g, 'import$1".$2.mjs";');
                // eslint-disable-next-line @typescript-eslint/quotes
                content = content.replace(/export(.*)"\.(.*)";/g, 'export$1".$2.mjs";');

                const sourceMapUrlRegexp = /\/\/# sourceMappingURL=data:application\/json;base64,(.*)/;

                const sourceMapMatch = sourceMapUrlRegexp.exec(content);
                if (sourceMapMatch && sourceMapMatch.length === 2) {
                    const sourceMapString = Buffer.from(sourceMapMatch[1], "base64").toString();
                    const sourceMap = JSON.parse(sourceMapString);
                    sourceMap.file = sourceMap.file.replace(".js", ".mjs");

                    for (let i = 0; i < sourceMap.sources.length; i++) {
                        const actualSrc = path.join(path.dirname(fullEntrySrc), sourceMap.sources[i]);
                        sourceMap.sources[i] = path
                            .relative(path.dirname(fullEntryDest), actualSrc)
                            .replace(/\\/g, "/");
                    }
                    const newSourcMap = Buffer.from(JSON.stringify(sourceMap)).toString("base64");
                    content = content.replace(
                        sourceMapUrlRegexp,
                        `//# sourceMappingURL=data:application/json;base64,${newSourcMap}`
                    );
                }

                await mkdir(path.dirname(fullEntryDest), { recursive: true });
                await writeFile(fullEntryDest, content, "utf8");

                if (removeOriginal) {
                    await unlink(fullEntrySrc);
                }
            } else if (st.isDirectory()) {
                console.log("Processing Dir", fullEntrySrc);
                await this.process(esDirBase, mjDirBase, relativeEntry, removeOriginal);
                console.log();
            }
        }
    }
}
