import { Arguments, Argv } from "yargs";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import AnchorMsgCommandExecutor from "./anchorMsgCommandExecutor";
import { encryptedParam, privateParam } from "./channelParams";

const params: ICommandParam[] = [
    {
        name: "seed",
        options: {
            type: "string",
            description: "IOTA Streams Subscriber's seed to use to anchor the message",
            required: true
        }
    },
    {
        name: "msg",
        options: {
            type: "string",
            description: "(JSON) Message content to be anchored",
            required: true
        }
    },
    {
        name: "channelID",
        options: {
            type: "string",
            description: "ID of the Channel ('address:announceMsgID') to anchor the message to",
            required: true
        }
    },
    {
        name: "anchorageID",
        options: {
            type: "string",
            description: "The anchorage point (message) ID to anchor the message to",
            required: true
        }
    },
    encryptedParam,
    privateParam
];

export default class AnchorMsgCommand implements ICommand {
    public subCommands: null;

    public name: string = "anchor";

    public description: string = "Anchors a message to an IOTA Streams Channel";

    public async execute(args: Arguments): Promise<boolean> {
        return AnchorMsgCommandExecutor.execute(args);
    }

    public register(yargs: Argv): void {
        params.forEach(aParam => {
            yargs.option(aParam.name, aParam.options);
        });
    }
}
