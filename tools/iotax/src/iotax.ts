#!/usr/bin/env node

import yargs from "yargs";
import IotaxConfigurator from "./iotaxConfigurator";

try {
  IotaxConfigurator.parseCommandLine(yargs);
} catch (error) {
    console.log("Error while parsing command line:", error);
}
