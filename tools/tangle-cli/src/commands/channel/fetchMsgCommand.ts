// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Arguments, Argv } from "yargs";
import { isDefined } from "../../globalParams";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import { channelParam, encryptedParam, privateParam } from "./channelParams";
import FetchMsgCommandExecutor from "./fetchMsgCommandExecutor";

const params: ICommandParam[] = [
    {
        name: "seed",
        options: {
            type: "string",
            description: "IOTA Streams Subscriber's seed to fetch on the channel",
            required: false
        }
    },
    {
        name: "psk",
        options: {
            type: "string",
            description: "IOTA Streams pre-shared key to fetch on the channel",
            required: false
        }
    },
    channelParam,
    {
        name: "msgID",
        options: {
            type: "string",
            description: "ID of the message to be fetched",
            required: false
        }
    },
    {
        name: "anchorageID",
        options: {
            type: "string",
            description: "ID of the anchorage where the message to be fetched is anchored to",
            required: true
        }
    },
    encryptedParam,
    privateParam
];

export default class FetchMsgCommand implements ICommand {
    public subCommands: null;

    public name: string = "fetch";

    public description: string = "Fetches one message previously anchored";

    public async execute(args: Arguments): Promise<boolean> {
        return FetchMsgCommandExecutor.execute(args);
    }

    public register(yargs: Argv): void {
        for (const aParam of params) {
            yargs.option(aParam.name, aParam.options);
        }

        yargs.check(fetchMsgChecks, false);
    }
}

/**
 * Check that the proper parameters are passed.
 *
 * @param argv The command line arguments.
 * @returns Boolean or throws an exception.
 * @throws {Error}
 */
function fetchMsgChecks(argv) {
    if (!isDefined(argv, "anchorageID") && isDefined(argv, "msgID")) {
        throw new Error("When specifying a msgID you need to also specify its anchorageID point");
    }

    if (!isDefined(argv, "seed") && !isDefined(argv, "psk")) {
        throw new Error("Please provide a seed or a pre-shared key");
    }

    return true;
}
