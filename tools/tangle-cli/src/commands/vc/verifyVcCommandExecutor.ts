import { Arguments } from "yargs";
import { isDefined, getNetworkParams } from "../../globalParams";
import { IdentityHelper } from "../identityHelper";
import { VcHelper } from "./vcHelper";

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

        if (!VcHelper.validateVp(vp).result) {
            console.log("Error:", "Not a VerifiablePresentation");
            return false;
        }

        try {
            const identityClient = IdentityHelper.getClient(getNetworkParams(args));

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
            if (!VcHelper.validateVc(vc).result) {
                console.log("Error:", "Not a VerifiableCredential");
                return false;
            }

            const identityClient = IdentityHelper.getClient(getNetworkParams(args));

            const verification = await identityClient.checkCredential(vc);

            console.log({ verified: verification.verified });
        } catch (error) {
            console.error("Error:", error);
            return false;
        }
        return true;
    }
}
