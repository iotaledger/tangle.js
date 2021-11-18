#!/usr/bin/env node
// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

import yargs from "yargs";
import TcliConfigurator from "./tcliConfigurator";

try {
    TcliConfigurator.parseCommandLine(yargs);
} catch (error) {
    console.log("Error while parsing command line:", error);
}
