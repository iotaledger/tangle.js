import { Arguments, Argv } from "yargs";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import IssueVcCommand from "./issueVcCommand";
import PresentVcCommand from "./presentVcCommand";
import VerifyVcCommand from "./verifyVcCommand";

const params: ICommandParam[] = [];

const subCommands: Record<string, ICommand> = {
  issue: new IssueVcCommand(),
  verify: new VerifyVcCommand(),
  present: new PresentVcCommand()
};

const checkFunction = argv => {
  if (argv.testnet || argv.comnet || argv.net) {
    throw new Error("Only the mainnet is supported for VCs");
  }

  return true;
};

export class VcCommand implements ICommand {
  public name: string = "vc";

  public description: string = "Verifiable Credential operations";

  public subCommands: Record<string, ICommand> = subCommands;

  public async execute(args: Arguments): Promise<boolean> {
    return true;
  }

  public register(yargs: Argv): void {
    params.forEach(aParam => {
      yargs.option(aParam.name, aParam.options);
    });

    yargs.check(checkFunction);

    Object.keys(subCommands).forEach(name => {
      const command: ICommand = subCommands[name];

      yargs.command(command.name,
        command.description,
        commandYargs => {
          command.register(commandYargs);
        },
        async commandYargs => command.execute(commandYargs)
      );
    });
  }
}
