// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Arguments, Argv } from "yargs";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import SubmitMsgCommandExecutor from "./submitMsgCommandExecutor";

const params: ICommandParam[] = [
    {
        name: "msg",
        options: {
            type: "string",
            description: "Message content to be submitted",
            required: true
        }
    },
    {
        name: "index",
        options: {
            type: "string",
            description: "Index for the message",
            required: true
        }
    }
];

export default class SubmitMsgCommand implements ICommand {
    public subCommands: null;

    public name: string = "submit";

    public description: string = "Message (indexation payload) submission";

    public async execute(args: Arguments): Promise<boolean> {
        return SubmitMsgCommandExecutor.execute(args);
    }

    public register(yargs: Argv): void {
        for (const aParam of params) {
            yargs.option(aParam.name, aParam.options);
        }
    }
}
