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
    async run(argv) {
        console.log("ESM Modules");
        console.log("===========");
        console.log("");
        if (argv.length < 4) {
            console.log("Usage:");
            console.log("\tesm-modules <es-dir> <mjs-dir> [--remove-src]");
            if (argv.length < 3) {
                console.error("Error: You must specify the src directory");
            }
            else if (argv.length < 4) {
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
        }
        catch (err) {
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
    async process(esDirBase, mjDirBase, srcRelativeDir, removeOriginal) {
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
                    content = content.replace(sourceMapUrlRegexp, `//# sourceMappingURL=data:application/json;base64,${newSourcMap}`);
                }
                await mkdir(path.dirname(fullEntryDest), { recursive: true });
                await writeFile(fullEntryDest, content, "utf8");
                if (removeOriginal) {
                    await unlink(fullEntrySrc);
                }
            }
            else if (st.isDirectory()) {
                console.log("Processing Dir", fullEntrySrc);
                await this.process(esDirBase, mjDirBase, relativeEntry, removeOriginal);
                console.log();
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxnQ0FBZ0M7QUFDaEMsdUNBQXVDO0FBQ3ZDLCtCQUErQjtBQUMvQixPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDaEYsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBRXhCOztHQUVHO0FBQ0gsTUFBTSxPQUFPLEdBQUc7SUFDWjs7OztPQUlHO0lBQ0ksS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFjO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRWhCLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7WUFDL0QsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO2FBQzlEO2lCQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQzthQUM3RDtZQUNELE9BQU8sQ0FBQyxDQUFDO1NBQ1o7UUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFB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