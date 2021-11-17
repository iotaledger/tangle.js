import { Arguments, Argv } from "yargs";
import ICommand from "../../ICommand";
import ICommandParam from "../../ICommandParam";
import IssueVcCommandExecutor from "./issueVcCommandExecutor";

const params: ICommandParam[] = [
    {
        name: "issuer",
        options: {
            type: "string",
            description: "DID of the issuer of the VC",
            required: true
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
        name: "expDate",
        options: {
            type: "string",
            description: "Expiration Date",
            required: false
        }
    },
    {
        name: "secret",
        options: {
            type: "string",
            description: "Secret key of the issuer",
            required: true
        }
    },
    {
        name: "subject",
        options: {
            type: "string",
            description: "(D)ID of the subject of the VC",
            required: true
        }
    },
    {
        name: "claims",
        options: {
            type: "string",
            description: "Credential claim data (As a JSON Object)",
            required: true
        }
    },
    {
        name: "type",
        options: {
            type: "string",
            description: "Credential type",
            required: false
        }
    },
    {
        name: "id",
        options: {
            type: "string",
            description: "Credential id",
            required: false
        }
    },
    {
        name: "json",
        options: {
            type: "boolean",
            description: "Output the credential in JSON format ready for cyp",
            required: false
        }
    }
];

export default class IssueVcCommand implements ICommand {
    public subCommands: null;

    public name: string = "issue";

    public description: string = "VC issuance";

    public async execute(args: Arguments): Promise<boolean> {
        return IssueVcCommandExecutor.execute(args);
    }

    public register(yargs: Argv): void {
        params.forEach(aParam => {
            yargs.option(aParam.name, aParam.options);
        });
    }
}
