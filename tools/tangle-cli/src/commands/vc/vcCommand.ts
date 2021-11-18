// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Arguments, Argv } from "yargs";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import IssueVcCommand from "./issueVcCommand";
import PresentVcCommand from "./presentVcCommand";
import VerifyVcCommand from "./verifyVcCommand";

const params: ICommandParam[] = [];

const subCommands: Record<string, ICommand> = {
    issue: new IssueVcCommand(),
    verify: new VerifyVcCommand(),
    present: new PresentVcCommand()
};

export class VcCommand implements ICommand {
    public name: string = "vc";

    public description: string = "Verifiable Credential operations";

    public subCommands: Record<string, ICommand> = subCommands;

    public async execute(args: Arguments): Promise<boolean> {
        return true;
    }

    public register(yargs: Argv): void {
        for (const aParam of params) {
            yargs.option(aParam.name, aParam.options);
        }

        for (const name of Object.keys(subCommands)) {
            const command: ICommand = subCommands[name];

            yargs.command(
                command.name,
                command.description,
                commandYargs => {
                    command.register(commandYargs);
                },
                async commandYargs => command.execute(commandYargs)
            );
        }
    }
}
