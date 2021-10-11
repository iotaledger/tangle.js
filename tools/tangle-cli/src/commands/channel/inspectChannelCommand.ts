import { Arguments, Argv } from "yargs";
import { isDefined } from "../../globalParams";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import { channelParam, encryptedParam, privateParam } from "./channelParams";
import InspectChannelCommandExecutor from "./inspectChannelCommandExecutor";

const params: ICommandParam[] = [
  {
    name: "seed",
    options: {
      type: "string",
      description: "IOTA Streams Subscriber's seed to inspect the channel",
      required: false
    }
  },
  {
    name: "psk",
    options: {
      type: "string",
      description: "Pre-shared key used to inspect the channel",
      required: false
    }
  },
  channelParam,
  encryptedParam,
  privateParam
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

    yargs.check(inspectChannelChecks, false);
  }
}

/**
 * Checks that either seed or psk are provided
 *
 * @param argv Arguments
 *
 * @returns true if one of them is provided
 */
function inspectChannelChecks(argv) {
  if (!isDefined(argv, "seed") && !isDefined(argv, "psk")) {
    throw new Error(
      "Please provide a seed or a pre-shared key"
    );
  }

  return true;
}
