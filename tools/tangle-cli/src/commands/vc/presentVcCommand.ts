import { Arguments, Argv } from "yargs";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import PresentVcCommandExecutor from "./presentVcCommandExecutor";

const params: ICommandParam[] = [
  {
    name: "vc",
    options: {
      type: "string",
      description: "VC to be presented",
      required: true
    }
  },
  {
    name: "holder",
    options: {
      type: "string",
      description:
      "Holder who presents the credential. By default is the credential subject",
      required: false
    }
  },
  {
    name: "method",
    options: {
      type: "string",
      description: "Verification Method",
      required: true
    }
  },
  {
    name: "secret",
    options: {
      type: "string",
      description: "Secret key of the holder",
      required: true
    }
  },
  {
    name: "id",
    options: {
      type: "string",
      description: "Presentation id",
      required: false
    }
  },
  {
    name: "type",
    options: {
      type: "string",
      description: "Presentation type",
      required: false
    }
  },
  {
    name: "json",
    options: {
      type: "boolean",
      description: "Output the credential presentation in JSON format ready for cyp",
      required: false
    }
  }
];

export default class PresentVcCommand implements ICommand {
  public subCommands: null;

  public name: string = "present";

  public description: string = "VC presentation";

  public async execute(args: Arguments): Promise<boolean> {
    return PresentVcCommandExecutor.execute(args);
  }

  public register(yargs: Argv): void {
    params.forEach(aParam => {
      yargs.option(aParam.name, aParam.options);
    });
  }
}
