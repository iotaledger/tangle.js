import { Arguments, Argv } from "yargs";
import { isDefined } from "../../globalParams";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import { seedParam } from "../commonParams";
import AnchorMsgCommandExecutor from "./anchorMsgCommandExecutor";

const params: ICommandParam[] = [
  seedParam,
  {
    name: "msg",
    options: {
      type: "string",
      description: "(JSON) Message content to be anchored",
      required: true
    }
  },
  {
    name: "channel",
    options: {
      type: "string",
      description: "ID of the Channel ('address:announceMsgID') to anchor the message to",
      required: false
    }
  },
  {
    name: "anchorageID",
    options: {
      type: "string",
      description: "The anchorage point (message) ID to anchor the message to",
      required: false
    }
  }
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

    yargs.check(anchorMsgChecks, false);
  }
}

/**
 * Check that the proper parameters are passed
 *
 * @param argv The command line arguments
 *
 * @returns boolean or throws an exception
 *
 */
 function anchorMsgChecks(argv) {
  if (!isDefined(argv, "anchorageID") && isDefined(argv, "channel")) {
    throw new Error(
      "When specifying a channel you need to also specify the anchorageID point"
    );
  } else {
    return true;
  }
}
