// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Credential, Document, ProofOptions } from "@iota/identity-wasm/node";
import { Arguments } from "yargs";
import { getNetworkParams } from "../../globalParams";
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

            const client = await IdentityHelper.getClient(getNetworkParams(args));
            const resolution = await client.resolve(issuerDid);

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

            const vc = Credential.extend(credentialMetadata);

            const scope = undefined;
            const signedVc = issDocument.signCredential(
                vc,
                new TextEncoder().encode(args.secret as string),
                issDocument.resolveMethod(args.method as string, scope).id(),
                ProofOptions.default()
            );

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

    private static getClaims(claimsStr: string): { [key: string]: unknown } | undefined {
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
