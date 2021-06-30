import { Arguments, Argv } from "yargs";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import GetMsgCommandExecutor from "./getMsgCommandExecutor";

const params: ICommandParam[] = [
  {
    name: "msgID",
    options: {
      type: "string",
      description: "ID of the message to be retrieved",
      required: true
    }
  }
];


export default class GetMsgCommand implements ICommand {
  public subCommands: null;

  public name: string = "get";

  public description: string = "Message retrieval";

  public async execute(args: Arguments): Promise<boolean> {
    return GetMsgCommandExecutor.execute(args);
  }

  public register(yargs: Argv): void {
    params.forEach(aParam => {
      yargs.option(aParam.name, aParam.options);
    });
  }
}
