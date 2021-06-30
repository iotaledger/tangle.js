import { Arguments, Argv } from "yargs";
import { isDefined } from "../../globalParams";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import { seedParam } from "../commonParams";
import FetchMsgCommandExecutor from "./fetchMsgCommandExecutor";

const params: ICommandParam[] = [
  seedParam,
  {
    name: "channel",
    options: {
      type: "string",
      description: "ID of the Channel ('address:announceMsgID') from which to fetch the message",
      required: false
    }
  },
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
      description: "ID of the anchorage where the message(s) to be fetched are anchored to",
      required: false
    }
  }
];

export default class FetchMsgCommand implements ICommand {
  public subCommands: null;

  public name: string = "fetch";

  public description: string = "Fetches one or more messages previously anchored to an IOTA Streams Channel";

  public async execute(args: Arguments): Promise<boolean> {
    return FetchMsgCommandExecutor.execute(args);
  }

  public register(yargs: Argv): void {
    params.forEach(aParam => {
      yargs.option(aParam.name, aParam.options);
    });

    yargs.check(fetchMsgChecks, false);
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
 function fetchMsgChecks(argv) {
  if (!isDefined(argv, "anchorageID") && isDefined(argv, "msgID")) {
    throw new Error(
      "When specifying a msgID you need to also specify its anchorageID point"
    );
  } else {
    return true;
  }
}
