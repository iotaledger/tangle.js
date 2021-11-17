import { Arguments, Argv } from "yargs";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import { encryptedParam, privateParam } from "./channelParams";
import CreateChannelCommandExecutor from "./createChannelCommandExecutor";

const params: ICommandParam[] = [
    {
        name: "seed",
        options: {
            type: "string",
            description: "IOTA Streams Author's seed for creating the channel",
            required: false
        }
    },
    {
        name: "psk",
        options: {
            type: "array",
            description: "Pre-shared keys",
            required: false
        }
    },
    encryptedParam,
    privateParam
];

export default class CreateChannelCommand implements ICommand {
    public subCommands: null;

    public name: string = "create";

    public description: string = "Creates a new Streams Channel";

    public async execute(args: Arguments): Promise<boolean> {
        return CreateChannelCommandExecutor.execute(args);
    }

    public register(yargs: Argv): void {
        params.forEach(aParam => {
            yargs.option(aParam.name, aParam.options);
        });
    }
}
