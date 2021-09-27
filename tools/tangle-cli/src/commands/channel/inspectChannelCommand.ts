import { Arguments, Argv } from "yargs";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import { channelParam, encryptedParam } from "./channelParams";
import InspectChannelCommandExecutor from "./inspectChannelCommandExecutor";

const params: ICommandParam[] = [
  {
    name: "seed",
    options: {
      type: "string",
      description: "IOTA Streams Subscriber's seed to inspect the channel",
      required: true
    }
  },
  channelParam,
  encryptedParam
];

export default class InspectChannelCommand implements ICommand {
  public subCommands: null;

  public name: string = "inspect";

  public description: string = "Inspects an anchoring channel, visiting all messages anchored with the same seed";

  public async execute(args: Arguments): Promise<boolean> {
    return InspectChannelCommandExecutor.execute(args);
  }

  public register(yargs: Argv): void {
    params.forEach(aParam => {
      yargs.option(aParam.name, aParam.options);
    });
  }
}

