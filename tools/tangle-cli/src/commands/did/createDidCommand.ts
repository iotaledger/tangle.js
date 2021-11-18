// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Arguments, Argv } from "yargs";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import CreateDidCommandExecutor from "./createDidCommandExecutor";

const params: ICommandParam[] = [
    {
        name: "didService",
        options: {
            type: "string",
            description: "List of DID services (JSON Array)",
            required: false
        }
    }
];

export default class CreateDidCommand implements ICommand {
    public subCommands: null;

    public name: string = "create";

    public description: string = "DID creation";

    public async execute(args: Arguments): Promise<boolean> {
        return CreateDidCommandExecutor.execute(args);
    }

    public register(yargs: Argv): void {
        for (const aParam of params) {
            yargs.option(aParam.name, aParam.options);
        }
    }
}
