import { Arguments } from "yargs";
import { getNetworkParams } from "../commonParams";
import { IdentityHelper } from "../identityHelper";

export default class ResolveDidCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const did = args.did as string;

    try {
      const identityClient = IdentityHelper.getClient(getNetworkParams(args));

      const resolution = await identityClient.resolve(did);

      console.log(resolution);
    } catch (error) {
      console.error("Error:", error);
      return false;
    }

    return true;
  }
}
