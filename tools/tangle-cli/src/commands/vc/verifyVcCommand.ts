import { Arguments, Argv } from "yargs";
import { isDefined } from "../../globalParams";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import VerifyVcCommandExecutor from "./verifyVcCommandExecutor";

const params: ICommandParam[] = [
    {
        name: "vc",
        options: {
            type: "string",
            description: "Verifiable Credential to be verified (As JSON)",
            required: false
        }
    },
    {
        name: "vp",
        options: {
            type: "string",
            description: "Verifiable Presentation to be verified (As JSON)",
            required: false
        }
    }
];

/**
 * Check that the proper parameters are passed
 *
 * @param argv The command line arguments
 *
 * @returns boolean or throws an exception
 *
 */
function verifyVcChecks(argv) {
    if (!isDefined(argv, "vc") && !isDefined(argv, "vp")) {
        throw new Error("Missing credential or presentation. Use --vc or --vp");
    } else {
        return true;
    }
}

export default class VerifyVcCommand implements ICommand {
    public subCommands: null;

    public name: string = "verify";

    public description: string = "VC / VP verification";

    public async execute(args: Arguments): Promise<boolean> {
        return VerifyVcCommandExecutor.execute(args);
    }

    public register(yargs: Argv): void {
        params.forEach(aParam => {
            yargs.option(aParam.name, aParam.options);
        });

        yargs.conflicts("vc", "vp");
        yargs.check(verifyVcChecks, false);
    }
}
