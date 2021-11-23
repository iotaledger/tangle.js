// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Arguments, Argv } from "yargs";
import commandRegistry from "./commandRegistry";
import { globalCheckFunction, globalConflicts, globalParams } from "./globalParams";
import ICommand from "./ICommand";

export default class TcliConfigurator {
    public static parseCommandLine(yargs: Argv): Arguments {
        for (const aParam of globalParams) {
            yargs.option(aParam.name, aParam.options);
        }

        yargs.conflicts(globalConflicts);
        yargs.check(globalCheckFunction, true);

        for (const name of Object.keys(commandRegistry)) {
            const command: ICommand = commandRegistry[name];

            yargs.command(command.name, command.description, commandYargs => {
                command.register(commandYargs);
            });
        }

        yargs.help();

        return yargs.argv;
    }
}
