// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Credential, Presentation, ProofOptions } from "@iota/identity-wasm/node";
import { Arguments } from "yargs";
import { getNetworkParams } from "../../globalParams";
import { IdentityHelper } from "../identityHelper";
import { VcHelper } from "./vcHelper";

export default class PresentVcCommandExecutor {
    public static async execute(args: Arguments): Promise<boolean> {
        const credential = args.vc as string;
        const presentationType = args.type as string;
        const presentationId = args.id as string;
        let holderDid = args.holder as string;

        try {
            const { result, credentialObj } = VcHelper.validateVc(credential);

            if (!result) {
                console.log("Error:", "Not a VerifiableCredential");
                return false;
            }

            // If no holder is passed then the holder is the subject
            if (!holderDid) {
                holderDid = (credentialObj.credentialSubject as Credential).toJSON().id;
            }

            const identityClient = await IdentityHelper.getClient(getNetworkParams(args));

            const holderDocument = (await identityClient.resolve(holderDid)).document();

            const vp = new Presentation(
                holderDocument,
                Credential.fromJSON(credentialObj),
                presentationType,
                presentationId
            );

            const scope = undefined;
            const method = holderDocument.resolveMethod(args.method as string, scope);

            const signedPresentation = holderDocument.signPresentation(
                vp,
                new TextEncoder().encode(args.secret as string),
                method.id(),
                ProofOptions.default()
            );

            let output = signedPresentation.toJSON();
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
}
