import { Arguments, Argv } from "yargs";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import SeedChannelCommandExecutor from "./seedChannelCommandExecutor";

const params: ICommandParam[] = [
    {
      name: "size",
      options: {
        type: "number",
        description: "Size of the seed",
        required: false
      }
    }
  ];

  export default class SeedChannelCommand implements ICommand {
    public subCommands: null;

    public name: string = "seed";

    public description: string = "Creates a new seed to be used to interact with channels";

    public async execute(args: Arguments): Promise<boolean> {
      return SeedChannelCommandExecutor.execute(args);
    }

    public register(yargs: Argv): void {
      params.forEach(aParam => {
        yargs.option(aParam.name, aParam.options);
      });
    }
  }
