#!/usr/bin/env node
"use strict";

process.title = "ESM Modules";

const m = require("../dist/cjs/index");

const cli = new m.CLI();
cli.run(process.argv).then(result => {
    process.exit(result);
});
