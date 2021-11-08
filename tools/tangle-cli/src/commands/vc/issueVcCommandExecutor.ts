/* eslint-disable no-duplicate-imports */
import { VerifiableCredential, Document } from "@iota/identity-wasm/node";
import { Arguments } from "yargs";
import { getNetworkParams } from "../commonParams";
import { IdentityHelper } from "../identityHelper";

export default class IssueVcCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const issuerDid = args.issuer as string;
    const subjectId = args.subject as string;

    const claims = this.getClaims(args.claims as string);

    if (!claims) {
      return false;
    }

    try {
      claims.id = subjectId;

      const resolution = await IdentityHelper.getClient(
        getNetworkParams(args)
      ).resolve(issuerDid);

      const issDocument = Document.fromJSON(resolution);

      const credentialMetadata: { [key: string]: unknown } = {
        id: args.id as string,
        type: args.type as string,
        issuer: issuerDid,
        credentialSubject: claims
      };

      if (args.expDate) {
        const date = args.expDate as string;
        const dateAsNumber = Date.parse(date);

        if (!Number.isNaN(dateAsNumber)) {
          credentialMetadata.expirationDate = date;
        }
      }

      const vc = VerifiableCredential.extend(credentialMetadata);

      const signedVc = issDocument.signCredential(vc, {
        private: args.secret,
        method: issDocument.resolveKey(args.method as string).toJSON().id
      });

      let output = signedVc.toJSON();
      if (args.json) {
        output = JSON.stringify(output, undefined, 2);
      }

      console.log(output);
    } catch (error) {
      console.log("Error:", error);
      return false;
    }

    return true;
  }

  private static getClaims(
    claimsStr: string
  ): { [key: string]: unknown } | undefined {
    let claims;

    try {
      claims = JSON.parse(claimsStr);
      if (typeof claims !== "object" || Array.isArray(claims)) {
        console.error("The claims data has to be provided as a JSON object");
        claims = undefined;
      }
    } catch (e) {
      console.error("Invalid claims object supplied:", e.message);
    }

    // eslint-disable-next-line  @typescript-eslint/no-unsafe-return
    return claims;
  }
}
