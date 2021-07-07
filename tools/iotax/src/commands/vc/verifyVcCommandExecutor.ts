import { Client as IdentityClient, Network, Config as IdentityConfig } from "@iota/identity-wasm/node";

import { Arguments } from "yargs";
import { isDefined } from "../../globalParams";
import { PERMANODE_URL } from "../commonParams";
import { IdentityHelper } from "../identityHelper";
import { validateVp, validateVc } from "./vcCommand";

export default class VerifyVcCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    if (isDefined(args, "vc")) {
      return this.doVerifyCredential(args);
    } else if (isDefined(args, "vp")) {
      return this.doVerifyPresentation(args);
    }
  }

  public static async doVerifyPresentation(args: Arguments): Promise<boolean> {
    const vp = args.vp as string;

    if (!validateVp(vp).result) {
      console.log("Error:", "Not a VerifiablePresentation");
      return false;
    }

    try {
      const identityConfig = new IdentityConfig();
      identityConfig.setNetwork(Network.mainnet());
      identityConfig.setNode(Network.mainnet().defaultNodeURL);
      identityConfig.setPermanode(PERMANODE_URL);
      const identityClient = IdentityClient.fromConfig(identityConfig);

      const verification = await identityClient.checkPresentation(vp);

      console.log({ verified: verification.verified });
    } catch (error) {
      console.error("Error:", error);
      return false;
    }

    return true;
  }

  public static async doVerifyCredential(args: Arguments): Promise<boolean> {
    const vc = args.vc as string;

    try {
      if (!validateVc(vc).result) {
        console.log("Error:", "Not a VerifiableCredential");
        return false;
      }

      const identityClient = IdentityHelper.getClient(args.network as string);

      const verification = await identityClient.checkCredential(vc);

      console.log({ verified: verification.verified });
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
    return true;
  }
}
