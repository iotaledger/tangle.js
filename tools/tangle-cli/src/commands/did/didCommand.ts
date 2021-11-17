import { Arguments, Argv } from "yargs";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import CreateDidCommand from "./createDidCommand";
import ResolveDidCommand from "./resolveDidCommand";

const params: ICommandParam[] = [];

const subCommands: Record<string, ICommand> = {
    create: new CreateDidCommand(),
    resolve: new ResolveDidCommand()
};

export class DidCommand implements ICommand {
    public name: string = "did";

    public description: string = "DID operations";

    public subCommands: Record<string, ICommand> = subCommands;

    public async execute(args: Arguments): Promise<boolean> {
        return true;
    }

    public register(yargs: Argv): void {
        params.forEach(aParam => {
            yargs.option(aParam.name, aParam.options);
        });

        Object.keys(subCommands).forEach(name => {
            const command: ICommand = subCommands[name];

            yargs.command(
                command.name,
                command.description,
                commandYargs => {
                    command.register(commandYargs);
                },
                async commandYargs => command.execute(commandYargs)
            );
        });
    }
}
