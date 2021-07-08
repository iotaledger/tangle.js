#!/usr/bin/env node

import yargs from "yargs";
import TcliConfigurator from "./tcliConfigurator";

try {
  TcliConfigurator.parseCommandLine(yargs);
} catch (error) {
    console.log("Error while parsing command line:", error);
}
