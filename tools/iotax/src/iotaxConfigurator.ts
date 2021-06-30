import { Arguments, Argv } from "yargs";
import commandRegistry from "./commandRegistry";
import { globalCheckFunction, globalConflicts, globalParams } from "./globalParams";
import ICommand from "./ICommand";

export default class IotaxConfigurator {
  public static parseCommandLine(yargs: Argv): Arguments {
    globalParams.forEach(aParam => {
      yargs.option(aParam.name, aParam.options);
    });

    yargs.conflicts(globalConflicts);
    yargs.check(globalCheckFunction, true);

    Object.keys(commandRegistry).forEach(name => {
      const command: ICommand = commandRegistry[name];

      yargs.command(command.name, command.description, commandYargs => {
        command.register(commandYargs);
      });
    });

    yargs.help();

    return yargs.argv;
  }
}
