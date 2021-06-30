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

const VC_TYPE = "VerifiableCredential";
const VP_TYPE = "VerifiablePresentation";

interface Credential {
  [key: string]: unknown;
}

/**
 * Validates a Verifiable Credential
 *
 * @param vc Verifiable Credential object
 *
 * @returns boolean indicating if validates or not
 *
 */
export function validateVc(vc: Credential | string): { result: boolean; credentialObj?: Credential } {
  return validateCredential(vc, VC_TYPE);
}

/**
 * Validates a Verifiable Presentation
 * @param cred Verifiable Presentation as an object or a string
 * @returns boolean indicating if validates or not
 */
export function validateVp(cred: Credential | string): { result: boolean; credentialObj?: Credential } {
  const { result, credentialObj } = validateCredential(cred, VP_TYPE);
  const vp = credentialObj;

  if (result) {
    const credentials = vp.verifiableCredential;
    let credArray: Credential[] = [];

    if (Array.isArray(credentials)) {
      credArray = credentials as Credential[];
    } else {
      credArray.push(credentials as Credential);
    }

    for (const aCred of credArray) {
      if (!validateVc(aCred).result) {
        return { result: false };
      }
    }

    return { result: true, credentialObj: vp };
  }

  return { result: false };
}

/**
 * Validates that the object represents a Vc or Vp
 *
 * @param cred The object to be validated
 *
 * @returns boolean indicating if validates or not
 */
export function validateVcOrVp(cred: Credential | string): { result: boolean; credentialObj?: Credential } {
  const { result, credentialObj } = validateCredential(cred, VC_TYPE);

  if (!result) {
    return validateCredential(cred, VP_TYPE);
  }

  return { result: true, credentialObj };
}

/**
 * Validates a credential that can be a Verifiable Credential or Verifiable Presentation
 *
 * @param cred Credential Object or stringified credential object
 * @param credType Type of Credential "VerifiableCredential" or "VerifiablePresentation"
 *
 * @returns boolean indicating whether it validated or not
 */
function validateCredential(cred: Credential | string, credType: string):
{ result: boolean; credentialObj?: Credential } {
  let vc = cred;

  if (!cred) {
    return { result: false };
  }

  if (typeof cred === "string") {
    try {
      vc = JSON.parse(cred) as Credential;
    } catch {
      return { result: false };
    }
  } else {
    vc = cred;
  }

  if (!vc.type) {
    return { result: false };
  }

  if (Array.isArray(vc.type)) {
    const types = vc.type as string[];
    if (!types.includes(credType)) {
      return { result: false };
    }
  } else if (typeof vc.type === "string") {
    if ((vc.type) !== credType) {
      return { result: false };
    }
  }

  return { result: true, credentialObj: vc };
}

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
