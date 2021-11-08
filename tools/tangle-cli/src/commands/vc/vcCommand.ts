import { Arguments, Argv } from "yargs";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import IssueVcCommand from "./issueVcCommand";
import PresentVcCommand from "./presentVcCommand";
import VerifyVcCommand from "./verifyVcCommand";

const params: ICommandParam[] = [
  {
    name: "net-id",
    options: {
      type: "string",
      description: "Identifier of the IOTA Tangle network. This option is ignored when using --mainnet or --devnet.",
      global: true,
      default: "main"
    }
  }
];

const subCommands: Record<string, ICommand> = {
  issue: new IssueVcCommand(),
  verify: new VerifyVcCommand(),
  present: new PresentVcCommand()
};

const checkFunction = argv => {
  if (argv.devnet) {
    console.warn("Warning: devnet identities will get pruned (no permanode).");
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
