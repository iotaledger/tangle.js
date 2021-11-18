// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Arguments, Argv } from "yargs";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import ResolveDidCommandExecutor from "./resolveDidCommandExecutor";

const params: ICommandParam[] = [
    {
        name: "did",
        options: {
            type: "string",
            description: "DID to be resolved",
            required: true
        }
    }
];

export default class ResolveDidCommand implements ICommand {
    public subCommands: null;

    public name: string = "resolve";

    public description: string = "DID resolution";

    public async execute(args: Arguments): Promise<boolean> {
        return ResolveDidCommandExecutor.execute(args);
    }

    public register(yargs: Argv): void {
        for (const aParam of params) {
            yargs.option(aParam.name, aParam.options);
        }
    }
}
