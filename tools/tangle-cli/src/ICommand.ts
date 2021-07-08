import { Arguments, Argv } from "yargs";

export default interface ICommand {
  name: string;
  subCommands: Record<string, ICommand>;
  description?: string;

  register(yargs: Argv): void;
  execute(args: Arguments): Promise<boolean>;
}
